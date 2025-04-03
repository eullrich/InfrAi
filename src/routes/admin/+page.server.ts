import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Database } from '$lib/database.types'; // Import generated types

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// Define the expected structure for the data we want to pass to the page
	type CompanyLoadData = Pick<Database['public']['Tables']['companies']['Row'], 'id' | 'name' | 'domain' | 'created_at'> & {
		company_insights: Pick<
			Database['public']['Tables']['company_insights']['Row'],
			'id' | 'processed_at' | 'llm_model_used' | 'tagline' | 'offering_labels' 
		> | null; 
	};

	let companies: CompanyLoadData[] = []; // Initialize empty array

	// Only attempt to fetch companies if the user is logged in
	if (session) {
		console.log('Admin page load: Session found, fetching companies...');
		const { data: fetchedCompanies, error: dbError } = await supabase
			.from('companies')
			.select(`
	        id, 
	        name,
	        domain,
	        created_at,
	        company_insights (
	            id,
	            processed_at,
	            llm_model_used,
	            tagline,
	            offering_labels 
	        )
	    `)
			.order('name');

		if (dbError) {
			console.error('Database error fetching companies for admin page:', dbError);
			// Throw error for logged-in users if DB fetch fails
			throw error(500, `Database error fetching companies: ${dbError.message}`);
		} 
		
		if (fetchedCompanies) {
			console.log(`Admin page load: Fetched ${fetchedCompanies.length} companies raw.`);
			try {
				// Process the data carefully
				companies = fetchedCompanies.map((c): CompanyLoadData => {
					// Ensure 'c' is treated as potentially having the structure from the query
					const companyData = c as any; // Use 'any' carefully for mapping flexibility
					
					let processedInsight: CompanyLoadData['company_insights'] = null;

					// Check if company_insights exists and is potentially an array or object
					if (companyData.company_insights) {
						const insightRaw = Array.isArray(companyData.company_insights) 
							? companyData.company_insights[0] 
							: companyData.company_insights;

						// Check if the extracted insight is a valid object
						if (typeof insightRaw === 'object' && insightRaw !== null) {
							processedInsight = { 
								id: insightRaw.id,
								processed_at: insightRaw.processed_at,
								llm_model_used: insightRaw.llm_model_used,
								tagline: insightRaw.tagline,
								offering_labels: insightRaw.offering_labels || [] // Default labels to empty array
							};
						}
					}
					
					return {
						id: companyData.id,
						name: companyData.name,
						domain: companyData.domain,
						created_at: companyData.created_at,
						company_insights: processedInsight // Assign the processed or null insight
					};
				});
				console.log(`Admin page load: Processed ${companies.length} companies.`);
			} catch (mapError: any) {
				console.error("Error mapping fetched company data:", mapError);
				// Throw error if mapping fails for logged-in user
				throw error(500, `Error processing company data: ${mapError.message}`);
			}
		} else {
			console.log('Admin page load: No companies data returned (fetchedCompanies is null/undefined).');
			// companies remains []
		}
	} else {
		console.log('Admin page load: No session found.');
		// companies remains []
	}

	// Return session and the processed companies array
	return { session, companies };
};

export const actions: Actions = {
	addCompany: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const domain = formData.get('domain')?.toString();

		// 1. Check if user is logged in
		if (!session?.user) {
			return fail(401, { success: false, message: 'You must be logged in to add a company.', name, domain });
		}

		// 2. Check if the logged-in user is an admin
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', session.user.id)
			.single();

		if (profileError) {
			console.error('Error fetching user profile:', profileError);
			return fail(500, { success: false, message: 'Error checking user permissions.', name, domain });
		}

		if (!profile?.is_admin) {
			return fail(403, { success: false, message: 'You do not have permission to add companies.', name, domain });
		}

		// 3. Proceed with adding the company if user is an admin
        if (!name) {
            return fail(400, { success: false, message: 'Company name is required.', name, domain });
        }
        if (!domain) {
             return fail(400, { success: false, message: 'Company domain is required.', name, domain });
        }

        try {
            const { data, error: insertError } = await supabase
                .from('companies')
                .insert({ name, domain }) 
                .select()
				.single(); // Expecting one row back

            if (insertError) {
                console.error('Error adding company:', insertError);
                return fail(500, { success: false, message: `Database error: ${insertError.message}`, name, domain });
            }

            // Return success with the newly added company data
            return { success: true, message: 'Company added successfully', company: data }; 
            
        } catch (err: any) {
            console.error('Exception adding company:', err);
            return fail(500, { success: false, message: `Server error: ${err.message}`, name, domain });
        }
    }
};
