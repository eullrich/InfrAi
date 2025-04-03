import type { PageServerLoad } from './$types'; // Correct type import
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase-init.server'; // Use server client for load function
import type { CompanyInsights } from '$lib/types'; // Import the detailed insights type

export const load: PageServerLoad = async ({ params, locals }) => { // Add locals for session
	const companyIdString = params.id;

	if (!companyIdString) {
		throw error(400, 'Company ID is required');
	}

	const companyIdNumber = parseInt(companyIdString, 10); // Parse ID to number

	if (isNaN(companyIdNumber)) {
		throw error(400, 'Invalid Company ID format');
	}

	// Fetch the company details
	const { data: companyData, error: companyError } = await supabase
		.from('companies')
		.select('id, name, domain') // Select 'domain' instead of 'website'
		.eq('id', companyIdNumber) // Use numeric ID
		.single();

	// If there's an error fetching the company or no data is returned, throw an error
	if (companyError) {
		console.error('Database error fetching company data:', companyError);
		throw error(500, `Database error: ${companyError.message}`);
	}
	if (!companyData) {
		// This case should ideally not happen if IDs are valid, but good to handle
		throw error(404, `Company with ID ${companyIdNumber} not found in the database.`);
	}

	// Fetch the generated insights for this company
	const { data: insightData, error: insightError } = await supabase
		.from('company_insights')
		.select(`
			tagline,
			mission,
			target_audience,
			offering_labels,
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
		.eq('company_id', companyIdNumber) // Use numeric ID
		.single(); // Expecting only one row per company due to UNIQUE constraint

	if (insightError && insightError.code !== 'PGRST116') { // PGRST116 = 'Exact one row expected' (means no row found)
		console.error('Error fetching company insights:', insightError);
		throw error(500, `Failed to fetch company insights: ${insightError.message}`);
	}

	// If no insight data is found, we still render the page but indicate it's missing
	if (!insightData) {
		console.log(`No insights found for company ID: ${companyIdNumber}`);
	}

	return {
		companyId: companyIdNumber, // Return numeric ID
		company: companyData, 
		insights: insightData, // Removed explicit cast
		session: null // Set session to null directly
	};
};
