import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const companyId = params.id;

  try {
    const response = await fetch(`/api/companies/${companyId}/scraped-data`);
    
    if (!response.ok) {
      throw new Error(`Error fetching scraped data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { 
      companyId, 
      pages: data.pages 
    };
  } catch (e) {
    console.error("Error in scraped-data page", e);
    error(500, 'Failed to load scraped data');
  }
};
