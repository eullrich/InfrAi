import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Database } from '$lib/database.types'; // Import generated types
// Note: supabase client is now available via locals, no need for separate init import

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// Define the expected structure based on the select query
	type CompanyLoadData = Pick<Database['public']['Tables']['companies']['Row'], 'id' | 'name' | 'domain' | 'created_at'> & {
		company_insights: Pick<
			Database['public']['Tables']['company_insights']['Row'],
			'id' | 'processed_at' | 'llm_model_used' | 'tagline' | 'offers_hosted_inference' | 'offers_rentable_gpus' | 'offers_finetuning_pipeline'
		> | null; // Assuming it's a one-to-one or null relationship based on the query structure
	};

	// Fetch companies only if logged in, otherwise return empty array
	let companies: CompanyLoadData[] = []; // Use the defined type
	if (session) {
		// The select query needs to match the CompanyLoadData structure
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
                offers_hosted_inference,
                offers_rentable_gpus,
                offers_finetuning_pipeline
            )
        `)
			.order('name');

		if (dbError) {
			console.error('Error fetching companies and insights:', dbError);
			// Consider returning an error state instead of throwing, 
			// as the page should still load to show the login form if not authenticated.
			// throw error(500, 'Database error: Could not fetch companies and insights.');
		} else {
			// Cast the fetched data to the specific type
			companies = (fetchedCompanies as CompanyLoadData[]) || [];
		}
	}

	// Always return the session status
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
			return fail(401, {
				success: false,
				message: 'You must be logged in to add a company.',
				name, // Keep form values
				domain // Keep form values
			});
		}

		// 2. Check if the logged-in user is an admin
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', session.user.id)
			.single();

		if (profileError) {
			console.error('Error fetching user profile:', profileError);
			return fail(500, {
				success: false,
				message: 'Error checking user permissions.',
				name, // Keep form values
				domain // Keep form values
			});
		}

		if (!profile?.is_admin) {
			return fail(403, {
				success: false,
				message: 'You do not have permission to add companies.',
				name, // Keep form values
				domain // Keep form values
			});
		}

		// 3. Proceed with adding the company if user is an admin
		// Validation (ensure name and domain are provided, as DB requires them)
        if (!name) {
            return fail(400, {
                success: false,
                message: 'Company name is required.',
                name,
                domain
            });
        }
        // Add validation for domain since it's required by the DB schema
        if (!domain) {
             return fail(400, {
                success: false,
                message: 'Company domain is required.',
                name,
                domain
            });
        }


        try {
            // Now we know name and domain are strings
            const { data, error: insertError } = await supabase
                .from('companies')
                .insert({ name, domain }) // Pass validated strings
                .select();

            if (insertError) {
                console.error('Error adding company:', insertError);
                return fail(500, { 
                    success: false, 
                    message: `Database error: ${insertError.message}`,
                    name,
                    domain
                });
            }

            return { 
                success: true, 
                message: 'Company added successfully', 
                company: data?.[0] 
            };
            
        } catch (err: any) {
            console.error('Exception adding company:', err);
            return fail(500, { 
                success: false, 
                message: `Server error: ${err.message}`,
                name,
                domain 
            });
        }
    }
};
