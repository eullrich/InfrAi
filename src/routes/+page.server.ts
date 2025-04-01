import { supabase } from '$lib/supabase-init.server'; // Corrected import path
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import type { CompanyWithInsights } from '$lib/types'; // Assuming a type definition exists or needs creation

export const load: PageServerLoad = async () => {
	console.log('Loading companies and insights for homepage...');
	const { data: companies, error: dbError } = await supabase
		.from('companies')
		.select(`
      id, 
      name, 
      company_insights (
        tagline,
        offers_hosted_inference,
        offers_rentable_gpus,
        offers_finetuning_pipeline
      )
    `); // Fetching related insights

	if (dbError) {
		console.error('Error fetching companies and insights:', dbError);
		throw error(500, 'Database error: Could not fetch companies and insights.');
	}

	// Supabase returns related data as an array. Since it's a one-to-one or one-to-zero relationship here, 
	// we'll flatten the structure for easier use in the component.
	const companiesWithFlattenedInsights = companies?.map(c => {
		// Ensure company_insights is an object, not an array, and handle null/undefined cases
		const insights = Array.isArray(c.company_insights) ? c.company_insights[0] : c.company_insights;
		return {
			...c,
			// Explicitly map insight fields, providing defaults if insights are missing
			tagline: insights?.tagline ?? null,
			offers_hosted_inference: insights?.offers_hosted_inference ?? false,
			offers_rentable_gpus: insights?.offers_rentable_gpus ?? false,
			offers_finetuning_pipeline: insights?.offers_finetuning_pipeline ?? false,
			// Remove the nested company_insights object after flattening
			company_insights: undefined 
		};
	}) || [];


	if (!companiesWithFlattenedInsights) {
		console.log('No companies or insights found.');
		return { companies: [] }; // Return the structured data
	}

	console.log(`Fetched ${companiesWithFlattenedInsights.length} companies with insights.`);
	// console.log('Data structure:', JSON.stringify(companiesWithFlattenedInsights[0], null, 2)); // For debugging
	return { companies: companiesWithFlattenedInsights as CompanyWithInsights[] }; // Pass the processed data
};
