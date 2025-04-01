import type { PageServerLoad } from './$types'; // Correct type import
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase-init.server'; // Use server client for load function

export const load: PageServerLoad = async ({ params }) => { // Correct function type and parameter typing
	const companyId = params.id;

	if (!companyId) {
		throw error(400, 'Company ID is required');
	}

	// Fetch the company details
	const { data: companyData, error: companyError } = await supabase
		.from('companies')
		.select('id, name, domain') // Select 'domain' instead of 'website'
		.eq('id', companyId)
		.single();

	// If there's an error fetching the company or no data is returned, throw an error
	if (companyError) {
		console.error('Database error fetching company data:', companyError);
		throw error(500, `Database error: ${companyError.message}`);
	}
	if (!companyData) {
		// This case should ideally not happen if IDs are valid, but good to handle
		throw error(404, `Company with ID ${companyId} not found in the database.`);
	}

	// Fetch the generated insights for this company
	const { data: insightData, error: insightError } = await supabase
		.from('company_insights')
		.select(`
			tagline,
			mission,
			target_audience,
			offers_hosted_inference,
			offers_rentable_gpus,
			offers_finetuning_pipeline,
			service_offerings,
			key_differentiators,
			technology_overview,
			partnerships,
			known_customers,
			pricing_overview,
			processed_at,
			llm_model_used,
			source_page_ids,
			x_url,
			linkedin_url
		`) // Select specific columns needed by the page
		.eq('company_id', companyId)
		.single(); // Expecting only one row per company due to UNIQUE constraint

	if (insightError && insightError.code !== 'PGRST116') { // PGRST116 = 'Exact one row expected' (means no row found)
		console.error('Error fetching company insights:', insightError);
		throw error(500, `Failed to fetch company insights: ${insightError.message}`);
	}

	// If no insight data is found, we still render the page but indicate it's missing
	if (!insightData) {
		console.log(`No insights found for company ID: ${companyId}`);
	}

	return {
		companyId,
		company: companyData, // Can be null if company fetch failed
		insights: insightData // Can be null if no insights found
	};
};
