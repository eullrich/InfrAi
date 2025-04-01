import { supabase } from '$lib/supabase-init.server';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async () => {
    // Fetch all companies with their insights data
    const { data: companies, error: dbError } = await supabase
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
        throw error(500, 'Database error: Could not fetch companies and insights.');
    }

    return { companies: companies || [] };
};

export const actions: Actions = {
    addCompany: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const domain = formData.get('domain')?.toString();

        if (!name) {
            return fail(400, { 
                success: false, 
                message: 'Company name is required',
                name,
                domain
            });
        }

        try {
            const { data, error: insertError } = await supabase
                .from('companies')
                .insert({ name, domain })
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
