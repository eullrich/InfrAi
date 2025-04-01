import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase-init.server'; // Server-side client
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';

// --- Configuration ---
const GEMINI_MODEL_NAME = 'gemini-2.5-pro-exp-03-25'; // Updated model name
const MAX_PAGES_TO_PROCESS = 25; // Increased limit
const MAX_TEXT_LENGTH = 150000; // Increased limit slightly to accommodate more pages
const PREFERRED_PATHS = ['/', '/pricing', '/about', '/contact', '/features']; // Key paths to prioritize

// --- Initialize Google AI Client ---
if (!GOOGLE_GEMINI_API_KEY) {
	console.error('GOOGLE_GEMINI_API_KEY is not set in environment variables.');
	// Optionally throw an error or handle appropriately
}
const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
	model: GEMINI_MODEL_NAME,
	// Safety settings can be adjusted if needed
	safetySettings: [
		{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
		{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
		{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
		{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
	],
	generationConfig: {
		responseMimeType: "application/json", // Ensure JSON output
	},
});


// --- Target JSON Schema Definition ---
// Matches the company_insights table structure
const desiredJsonSchema = `{
  "tagline": "string | null", // Note: company_name is derived from the 'companies' table, not extracted here.
  "mission": "string | null",
  "service_offerings": [
    {
      "name": "string",
      "description": "string",
      "tags": ["string"]
    }
  ] | null,
  "pricing_overview": "string | null",
  "known_customers": ["string"] | null,
  "offers_hosted_inference": "boolean",
  "offers_rentable_gpus": "boolean",
  "offers_finetuning_pipeline": "boolean",
  "target_audience": "string | null",
  "key_differentiators": ["string"] | null,
  "technology_overview": "string | null",
  "partnerships": ["string"] | null,
  "x_url": "string | null",
  "linkedin_url": "string | null"
}`;

// --- POST Request Handler ---
export const POST: RequestHandler = async ({ params }) => {
	const companyId = params.id;

	if (!companyId) {
		throw error(400, 'Company ID is required');
	}

	if (!GOOGLE_GEMINI_API_KEY) {
		throw error(500, 'Server configuration error: Missing Gemini API Key');
	}

	try {
		// 1. Fetch relevant parsed text from 'pages' table, prioritizing key paths
		// Construct the CASE statement for ordering
		const pathPrioritization = PREFERRED_PATHS.map((path, index) => `WHEN url LIKE '%${path}' THEN ${index}`).join('\n            ');
		const orderByClause = `
            CASE
                ${pathPrioritization}
                ELSE ${PREFERRED_PATHS.length}
            END,
            crawl_date DESC
        `;

		const { data: pagesData, error: pagesError } = await supabase
			.from('pages')
			.select('id, parsed_text, url') // Select id to store as source_page_ids
			.eq('company_id', companyId)
			// .order('crawl_date', { ascending: false }) // Prioritize recent pages - replaced by custom ordering
			// Manually construct the order clause as Supabase client might not directly support complex CASE in order()
			// This is a workaround; ideally, use a view or function if this gets more complex.
			// Note: Direct string injection into order is generally discouraged, but Supabase client options are limited here.
			// Ensure companyId is properly handled to prevent SQL injection risks elsewhere.
			// A safer approach might involve fetching more data and sorting/filtering in code, but let's try this first.
			// UPDATE: Supabase JS client doesn't directly support raw ORDER BY clauses like this.
			// We'll fetch more pages and prioritize in code instead. Fetching 2x the limit initially.
			.order('crawl_date', { ascending: false })
			.limit(MAX_PAGES_TO_PROCESS * 2); // Fetch more to allow for prioritization

		if (pagesError) {
			console.error('Supabase error fetching pages:', pagesError);
			throw error(500, `Failed to fetch page data: ${pagesError.message}`);
		}

		if (!pagesData || pagesData.length === 0) {
			return json({ message: 'No page data found for this company to process.' }, { status: 404 });
		}

		// Prioritize and select pages in code
		const prioritizedPages = pagesData.sort((a, b) => {
			const aPriority = PREFERRED_PATHS.findIndex(path => a.url.endsWith(path));
			const bPriority = PREFERRED_PATHS.findIndex(path => b.url.endsWith(path));

			const aScore = aPriority === -1 ? PREFERRED_PATHS.length : aPriority;
			const bScore = bPriority === -1 ? PREFERRED_PATHS.length : bPriority;

			if (aScore !== bScore) {
				return aScore - bScore; // Lower index (preferred path) comes first
			}
			// If priorities are equal, fallback to original order (crawl_date DESC)
			// Since we fetched sorted by date, the relative order is maintained here.
			return 0;
		}).slice(0, MAX_PAGES_TO_PROCESS); // Limit to the final desired number


		// Combine text, respecting length limits
		let combinedText = prioritizedPages
			.map(page => `URL: ${page.url}\n\n${page.parsed_text || ''}`.trim())
			.join('\n\n---\n\n'); // Separate pages clearly

		if (combinedText.length > MAX_TEXT_LENGTH) {
			combinedText = combinedText.substring(0, MAX_TEXT_LENGTH) + '... [TRUNCATED]';
		}

		const sourcePageIds = prioritizedPages.map(page => page.id);

		// 2. Construct the prompt for Gemini using the detailed instructions
		const prompt = `Analyze the provided text from the company’s website (multiple pages might be included, separated by '---') and extract the following information to populate the company_insights table. Return the results in JSON format, using the exact field names specified below. If information for a field is not found, use null for nullable fields (e.g., text, jsonb, ARRAY) or false for boolean fields.

**Fields to Extract:**

*   **tagline (text):**
    *   Extract a short, catchy phrase that encapsulates the company’s value proposition or unique selling point.
    *   Look for prominent text in the hero section, main H1 heading, meta tags, or social media descriptions, especially on the home page (URL ending in '/').
    *   If multiple candidates exist, choose the most concise and prominent one that reflects the company’s brand or mission.
*   **pricing_overview (text):**
    *   Prioritize content from URLs ending in '/pricing'.
    *   Look for pricing tables, plans, or tiers, and extract key details such as plan names, features, and price ranges (e.g., "$99/month for Basic Plan").
    *   If no dedicated pricing page exists, summarize any pricing details found elsewhere (e.g., blog posts, FAQs).
    *   If no pricing information is available, return "Not available" or "Pricing upon request" if the text suggests it. Otherwise use null.
*   **mission (text):**
    *   Extract the company’s mission statement, often found on 'About Us' pages (URLs ending in '/about').
    *   If not explicitly labeled as a mission, look for vision statements, company values, or overarching goals in sections like the CEO’s message, company history, or home page.
    *   Summarize in a concise sentence if the statement is lengthy.
*   **x_url (text) and linkedin_url (text):**
    *   Search for explicit links pointing to 'twitter.com' or 'linkedin.com', with special attention to footer sections.
    *   Also, look for social media icons or buttons that link to these platforms, even if the domain isn’t explicitly written.
    *   Extract the full profile URL (e.g., "https://twitter.com/companyname"). If not found, use null.
*   **service_offerings (jsonb):**
    *   List distinct products or services described, including their names and brief descriptions.
    *   Categorize them into broader categories (e.g., "hardware", "software", "consulting") and include relevant keywords as tags (e.g., "AI", "cloud").
    *   Format as a JSON array of objects, e.g., [{"name": "Product A", "description": "AI-powered tool", "category": "software", "tags": ["AI", "automation"]}]. Use null if none found.
*   **known_customers (ARRAY of text):**
    *   List names of companies mentioned as customers or clients.
    *   Look for phrases like "trusted by", "customers include", or similar sections.
    *   Check case studies, testimonials, client lists, press releases, or news articles.
    *   Review text associated with company logos (e.g., alt text, captions) as these often indicate customers.
    *   Return as an array of strings, e.g., ["Company A", "Company B"]. Use null if none are found.
*   **offers_hosted_inference (boolean):**
    *   Determine if the company provides hosted inference services.
    *   Look for keywords/phrases like "hosted inference," "model hosting," "inference API," or similar.
    *   Return true if mentioned, false otherwise.
*   **offers_rentable_gpus (boolean):**
    *   Determine if the company offers rentable GPUs.
    *   Look for keywords/phrases like "GPU rental," "cloud GPUs," "GPU access," or similar.
    *   Return true if mentioned, false otherwise.
*   **offers_finetuning_pipeline (boolean):**
    *   Determine if the company provides a fine-tuning pipeline for models.
    *   Look for keywords/phrases like "fine-tuning pipeline," "model customization," "tuning service," or similar.
    *   Return true if mentioned, false otherwise.
*   **target_audience (text):**
    *   Identify the intended customer base by analyzing mentions of industries (e.g., "healthcare"), company sizes (e.g., "SMBs"), or use cases (e.g., "data scientists").
    *   Summarize in a brief description, e.g., "Enterprises in healthcare and finance". Use null if not specified.
*   **key_differentiators (ARRAY of text):**
    *   Extract what sets the company apart from competitors, such as unique features, proprietary technology, or competitive advantages.
    *   Look for phrases like "patented technology," "industry-first," or specific benefits highlighted in the text.
    *   Return as an array of strings, e.g., ["Proprietary AI algorithms", "Real-time processing"]. Use null if none are found.
*   **technology_overview (text):**
    *   Summarize the company’s technological approach.
    *   Look for descriptions of their tech stack, algorithms, or innovative methods (e.g., "Uses deep learning and cloud infrastructure").
    *   Use null if no specific details are provided.
*   **partnerships (ARRAY of text):**
    *   List names of companies mentioned as partners (not customers), often in partnership sections, integrations, or collaborative projects.
    *   Return as an array of strings, e.g., ["Partner A", "Partner B"]. Use null if none are found.

**Additional Instructions:**
*   Focus on Relevance: Prioritize information directly tied to the company’s core business and offerings. Avoid generic or unrelated content.
*   List Fields: For fields requiring lists (e.g., service_offerings, known_customers, partnerships), return arrays, even if empty ([]) or null if no data exists.
*   Boolean Fields: Return true only with clear evidence in the text; default to false otherwise.
*   Text Prioritization: If the input text is extensive, focus on key pages like home ('/'), about ('/about'), products/services, and pricing ('/pricing').
*   Output Format: Ensure the output is valid JSON, with field names matching the company_insights table exactly.

Desired JSON Schema (for reference, ensure output matches this structure):
\`\`\`json
${desiredJsonSchema}
\`\`\`

Website Text (Prioritized pages like '/', '/pricing', '/about' included if found):
--- START TEXT ---
${combinedText}
--- END TEXT ---

Generate the JSON output:`;

		// 3. Call the Gemini API
		console.log(`Calling Gemini for company ID: ${companyId} using model ${GEMINI_MODEL_NAME}...`);
		const result = await model.generateContent(prompt);
		const response = result.response;

		if (!response || !response.text()) {
			console.error('Gemini API response was empty or invalid.');
			throw error(500, 'Failed to get valid response from LLM');
		}

		const llmOutputText = response.text();
		console.log(`Gemini response received for company ID: ${companyId}. Raw Output Length: ${llmOutputText.length}`);
		// Log first/last few characters for quick inspection, avoiding logging potentially huge outputs entirely
		console.log(`Raw Output Start: ${llmOutputText.substring(0, 100)}...`);
		console.log(`Raw Output End: ...${llmOutputText.substring(llmOutputText.length - 100)}`);


		// 4. Parse the LLM JSON response
		let insightsData;
		try {
			// Attempt to extract JSON robustly: find first '{' and last '}'
			const jsonStart = llmOutputText.indexOf('{');
			const jsonEnd = llmOutputText.lastIndexOf('}');

			if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
				console.error('Could not find valid JSON structure ({...}) in LLM response.');
				console.error('LLM Raw Output Text:', llmOutputText); // Log the full raw output when structure is missing
				throw new Error('Valid JSON object not found in response');
			}

			const potentialJsonString = llmOutputText.substring(jsonStart, jsonEnd + 1);
			console.log('Attempting to parse extracted JSON string...');
			insightsData = JSON.parse(potentialJsonString);
			console.log('Successfully parsed JSON from LLM response.');

		} catch (parseError: any) {
			console.error('Failed to parse JSON response from LLM:', parseError);
			// Log the full raw output only on error for detailed debugging
			console.error('LLM Raw Output Text:', llmOutputText);
			throw error(500, `Failed to parse LLM response: ${parseError.message}`);
		}

		// Add metadata
		const dataToUpsert = {
			...insightsData,
			company_id: companyId,
			llm_model_used: GEMINI_MODEL_NAME, // Keep track of the model used for generation
			processed_at: new Date().toISOString(),
			source_page_ids: sourcePageIds
		};

		// 5. Upsert data into 'company_insights' table
		const { error: upsertError } = await supabase
			.from('company_insights')
			.upsert(dataToUpsert, { onConflict: 'company_id' }); // Use company_id to handle conflicts (update if exists)

		if (upsertError) {
			console.error('Supabase error upserting insights:', upsertError);
			throw error(500, `Failed to save insights: ${upsertError.message}`);
		}

		console.log(`Successfully processed and saved insights for company ID: ${companyId}`);
		return json({ success: true, message: 'Insights generated and saved successfully.' });

	} catch (err: any) {
		console.error(`Error processing insights for company ${companyId}:`, err);
		// Use the error status if it's an HttpError, otherwise default to 500
		const statusCode = err.status || 500;
		const message = err.body?.message || err.message || 'An unexpected error occurred.';
		throw error(statusCode, message);
	}
};
