import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase-init.server';

export async function GET({ params }: RequestEvent) {
  const companyId = params.id;

  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('id, url, title, parsed_text')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching pages:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ pages: pages || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error("Error in company data API:", e);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
