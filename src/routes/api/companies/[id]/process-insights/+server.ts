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
// Matches the updated company_insights table structure
const desiredJsonSchema = `{
  "tagline": "string | null", 
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
  "offering_labels": ["string"] | null, // Updated: Replaced boolean flags with labels array
  "target_audience": "string | null",
  "key_differentiators": ["string"] | null,
  "technology_overview": "string | null",
  "partnerships": ["string"] | null,
  "x_url": "string | null",
  "linkedin_url": "string | null"
}`;

// --- POST Request Handler ---
export const POST: RequestHandler = async ({ params }) => {
	const companyIdString = params.id;

	if (!companyIdString) {
		throw error(400, 'Company ID is required');
	}

	const companyId = parseInt(companyIdString, 10); // Parse the ID string to a number

	if (isNaN(companyId)) {
		throw error(400, 'Invalid Company ID format'); // Handle cases where ID is not a number
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
			.eq('company_id', companyId) // Use the parsed numeric ID
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
			return 0;
		}).slice(0, MAX_PAGES_TO_PROCESS); 


		// Combine text, respecting length limits
		let combinedText = prioritizedPages
			.map(page => `URL: ${page.url}\n\n${page.parsed_text || ''}`.trim())
			.join('\n\n---\n\n'); 

		if (combinedText.length > MAX_TEXT_LENGTH) {
			combinedText = combinedText.substring(0, MAX_TEXT_LENGTH) + '... [TRUNCATED]';
		}

		const sourcePageIds = prioritizedPages.map(page => page.id);

		// 2. Construct the prompt for Gemini using the updated instructions
		const prompt = `Analyze the provided text from the company’s website (multiple pages might be included, separated by '---') and extract the following information to populate the company_insights table. Return the results in JSON format, using the exact field names specified below. If information for a field is not found, use null.

**Fields to Extract:**

*   **tagline (text):** Extract a short, catchy phrase encapsulating the company’s value proposition. Look in hero sections, H1s, meta tags. Choose the most concise and prominent.
*   **pricing_overview (text):** Prioritize '/pricing' URLs. Extract details like plan names, features, price ranges. Summarize if found elsewhere. Use "Not available" or "Pricing upon request" if applicable, otherwise null.
*   **mission (text):** Extract the mission statement, often on 'About Us' pages. Look for vision statements or company values if not explicit. Summarize if lengthy.
*   **x_url (text) and linkedin_url (text):** Search for explicit links to 'twitter.com' or 'linkedin.com', especially in footers. Look for social media icons. Extract full profile URL or use null.
*   **service_offerings (jsonb):** List distinct products/services with names, descriptions. Include relevant keywords as tags (e.g., "AI", "cloud"). Format as JSON array of objects: [{"name": "Product A", "description": "...", "tags": ["AI"]}]. Use null if none found.
*   **known_customers (ARRAY of text):** List company names mentioned as customers/clients. Look for "trusted by", case studies, testimonials, logos. Return array of strings or null.
*   **offering_labels (ARRAY of text):** Determine the key offerings based on keywords and add corresponding labels to an array. Return null or an empty array if none apply.
    *   If text mentions "hosted inference," "model hosting," "inference API," or similar, include the label "Hosted Inference".
    *   If text mentions "GPU rental," "cloud GPUs," "GPU access," or similar, include the label "Rentable GPUs".
    *   If text mentions "fine-tuning pipeline," "model customization," "tuning service," or similar, include the label "Finetuning".
    *   If text mentions "RPC endpoint," "node service," "blockchain API," or similar, include the label "RPC Service".
    *   If text mentions "on-chain data," "blockchain data," "indexed data," or similar, include the label "Onchain Data".
    *   If text mentions "bare metal," "dedicated server," or similar, include the label "Baremetal Server".
    *   If text mentions "VPS," "virtual private server," "cloud server," or similar, include the label "Virtual Private Server".
    *   If text mentions "hosted database," "managed database," "database service," or similar, include the label "Hosted Database".
*   **target_audience (text):** Identify intended customers (industries, company sizes, use cases). Summarize briefly (e.g., "Enterprises in healthcare"). Use null if not specified.
*   **key_differentiators (ARRAY of text):** Extract unique selling points (unique features, proprietary tech). Look for "patented technology," "industry-first." Return array of strings or null.
*   **technology_overview (text):** Summarize the tech stack, algorithms, methods (e.g., "Uses deep learning"). Use null if no details.
*   **partnerships (ARRAY of text):** List names of partners (not customers). Look in partnership sections, integrations. Return array of strings or null.

**Additional Instructions:**
*   Focus on Relevance: Prioritize info tied to core business.
*   List Fields: For array fields (service_offerings, known_customers, partnerships, offering_labels), return arrays, even if empty ([]) or null if no data exists.
*   Text Prioritization: Focus on key pages like home ('/'), about ('/about'), products/services, pricing ('/pricing').
*   Output Format: Ensure valid JSON matching the schema exactly.

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
		console.log(`Raw Output Start: ${llmOutputText.substring(0, 100)}...`);
		console.log(`Raw Output End: ...${llmOutputText.substring(llmOutputText.length - 100)}`);


		// 4. Parse the LLM JSON response
		let insightsData;
		try {
			const jsonStart = llmOutputText.indexOf('{');
			const jsonEnd = llmOutputText.lastIndexOf('}');

			if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
				console.error('Could not find valid JSON structure ({...}) in LLM response.');
				console.error('LLM Raw Output Text:', llmOutputText); 
				throw new Error('Valid JSON object not found in response');
			}

			const potentialJsonString = llmOutputText.substring(jsonStart, jsonEnd + 1);
			console.log('Attempting to parse extracted JSON string...');
			insightsData = JSON.parse(potentialJsonString);
			console.log('Successfully parsed JSON from LLM response.');

		} catch (parseError: any) {
			console.error('Failed to parse JSON response from LLM:', parseError);
			console.error('LLM Raw Output Text:', llmOutputText);
			throw error(500, `Failed to parse LLM response: ${parseError.message}`);
		}

		// Add metadata - insightsData should now contain offering_labels instead of boolean flags
		const dataToUpsert = {
			...insightsData,
			company_id: companyId, // Use the parsed numeric ID
			llm_model_used: GEMINI_MODEL_NAME, 
			processed_at: new Date().toISOString(),
			source_page_ids: sourcePageIds
		};

		// 5. Upsert data into 'company_insights' table
		const { error: upsertError } = await supabase
			.from('company_insights')
			.upsert(dataToUpsert, { onConflict: 'company_id' }); 

		if (upsertError) {
			console.error('Supabase error upserting insights:', upsertError);
			throw error(500, `Failed to save insights: ${upsertError.message}`);
		}

		console.log(`Successfully processed and saved insights for company ID: ${companyId}`);
		return json({ success: true, message: 'Insights generated and saved successfully.' });

	} catch (err: any) {
		console.error(`Error processing insights for company ${companyId}:`, err);
		const statusCode = err.status || 500;
		const message = err.body?.message || err.message || 'An unexpected error occurred.';
		throw error(statusCode, message);
	}
};
