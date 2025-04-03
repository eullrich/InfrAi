import { supabase } from '$lib/supabase-init.server'; // Corrected import path
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import type { CompanyWithInsights } from '$lib/types'; // Assuming a type definition exists or needs creation

// Add event argument to match PageServerLoad type signature
export const load: PageServerLoad = async (event) => { 
	console.log('Loading companies and insights for homepage...');
	
	let companiesWithFlattenedInsights: CompanyWithInsights[] = [];
	let uniqueTags: string[] = [];

	try {
		// We don't need event.locals here, but including the argument satisfies the type.
		const { data: companies, error: dbError } = await supabase
			.from('companies')
			.select(`
	      id,
	      name,
	      company_insights (
	        tagline,
	        offering_labels, 
	        service_offerings 
	      )
	    `) // Removed comments from select string
			.order('name', { ascending: true }); // Add ordering for consistency

		if (dbError) {
			console.error('Error fetching companies and insights:', dbError);
			// Throw the error to trigger SvelteKit's error page
			throw error(500, `Database error fetching companies: ${dbError.message}`);
		}

		if (!companies) {
			console.log('No companies data returned from Supabase.');
			// Return empty data, page will show "No Companies Found"
			return { companies: [], uniqueTags: [], session: null };
		}

		// Map and flatten data
		companiesWithFlattenedInsights = companies.map((c: any) => { 
			const insights = Array.isArray(c?.company_insights) 
				? c.company_insights[0] 
				: (typeof c?.company_insights === 'object' && c.company_insights !== null ? c.company_insights : null);

			// Define default structure for insights if null
			const safeInsights = insights || {
				tagline: null,
				offering_labels: [], 
				service_offerings: [] 
			};

			// Extract tags from service_offerings for filter UI (needed by +page.svelte)
			const serviceOfferingsTags = (safeInsights.service_offerings && Array.isArray(safeInsights.service_offerings)
				? safeInsights.service_offerings.flatMap((so: { tags?: string[] }) => so?.tags || []) 
				: []) as string[];

			return {
				id: c.id,
				name: c.name,
				tagline: safeInsights.tagline, 
				offering_labels: safeInsights.offering_labels || [],
				service_offerings_tags: serviceOfferingsTags // Ensure this is included for filtering
			};
		});

		// Extract all unique tags from offering_labels for the FILTER UI
		const allTags = new Set<string>();
		companies.forEach((c: any) => { // Iterate over original companies data
			if (!c || !c.company_insights) return;

			const insights = Array.isArray(c.company_insights)
				? c.company_insights[0]
				: (typeof c.company_insights === 'object' && c.company_insights !== null ? c.company_insights : null);

			if (!insights) return;

			const labels = insights.offering_labels; // Use offering_labels
			if (labels && Array.isArray(labels)) {
				labels.forEach((label: string) => { // Iterate through labels
					if (label) {
						allTags.add(label); // Add each label to the set
					}
				});
			}
		});
		uniqueTags = Array.from(allTags).sort();

	} catch (err: any) {
		// Catch any unexpected errors during processing
		console.error('Unexpected error in homepage load function:', err);
		// Throw a generic 500 error
		throw error(500, err.message || 'An unexpected error occurred while loading homepage data.');
	}

	// Final check before returning
	if (!companiesWithFlattenedInsights) {
		companiesWithFlattenedInsights = []; // Ensure it's always an array
	}

	console.log(`Fetched ${companiesWithFlattenedInsights.length} companies with insights.`);
	console.log(`Found ${uniqueTags.length} unique tags: ${uniqueTags.join(', ')}`);
	
	return { 
		companies: companiesWithFlattenedInsights, 
		uniqueTags: uniqueTags,
		session: null 
	}; 
};
