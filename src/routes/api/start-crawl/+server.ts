// src/routes/api/start-crawl/+server.ts
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase-init.server';

// Flag to prevent multiple crawls from running simultaneously
let crawling = false;

// Updated crawlNext to accept baseDomain for domain filtering
async function crawlNext(companyId: number, baseDomain: string): Promise<void> {
  if (crawling) return;
  crawling = true;

  try {

    while (true) {
      // Fetch the next uncrawled page, including depth
      const { data: pages, error } = await supabase
        .from('pages')
        .select('url, depth')
        .eq('company_id', companyId)
        .is('raw_html', null)
        .limit(1);

      if (error || pages.length === 0) {
        crawling = false; // Stop if no more pages or an error occurs
        break;
      }

      const { url, depth } = pages[0];

      try {
        // Fetch the page content
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();

        // Parse HTML with cheerio
        const $ = cheerio.load(html);
        const title = $('title').text();
        const parsedText = $('body').text().replace(/\s+/g, ' ').trim();

        // Extract links only if depth === 0, within the same domain
        if (depth === 0) {
          const links: string[] = [];
          $('a[href]').each((i: number, elem: any) => {
            const href = $(elem).attr('href');
            if (!href) return;
            try {
              // Resolve relative or absolute URLs
              const absoluteUrl = new URL(href, url);
              const linkHostname = absoluteUrl.hostname;
              const baseHostname = new URL(baseDomain).hostname; // Get hostname from baseDomain (e.g., hyperbolic.xyz)

              // Include links if hostname matches base or is a subdomain of base and does not contain '#'
              if ((linkHostname === baseHostname || linkHostname.endsWith('.' + baseHostname)) && !absoluteUrl.hash) {
                links.push(absoluteUrl.href);
              }
            } catch (e) {
              // Ignore invalid URLs
              console.warn(`Skipping invalid URL '${href}' found on ${url}: ${e}`);
            }
          });

          // Insert new links with depth 1, ignoring duplicates individually
          if (links.length > 0) {
            console.error(`[${companyId}] Found ${links.length} potential new pages (depth 1) on ${url}. Attempting individual inserts...`);
            for (const link of links) {
              const newPage = { company_id: companyId, url: link, depth: 1 };
              const { error: insertError } = await supabase.from('pages').insert(newPage);

              if (insertError) {
                if (insertError.code === '23505') {
                  // Log duplicate skips individually
                  console.error(`[${companyId}] Page already existed, skipped insertion: ${link}`);
                } else {
                  // Log other critical errors more prominently
                  console.error(`[${companyId}] CRITICAL ERROR inserting page ${link}:`, insertError.message, insertError.details, insertError.hint);
                }
              } else {
                // Log individual success
                console.error(`[${companyId}] Successfully inserted new page: ${link}`);
              }
            }
            console.error(`[${companyId}] Finished attempting individual inserts for pages found on ${url}.`);
          } else {
            console.error(`[${companyId}] No new depth 1 links found or matched domain filter on ${url}.`); // Log if no links found/matched
          }
        }

        // Update the current page with crawled data
        await supabase
          .from('pages')
          .update({
            raw_html: html,
            parsed_text: parsedText,
            title: title,
            crawl_date: new Date().toISOString()
          })
          .eq('url', url);

        // Add a delay to avoid overwhelming the server or target website
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Failed to crawl ${url}:`, err);
        // Mark the page as processed to avoid infinite loops
        await supabase
          .from('pages')
          .update({ crawl_date: new Date().toISOString() })
          .eq('url', url);
      }
    }
  } catch (e) {
    console.error("Error in crawlNext", e)
  }
}

export async function POST({ request }: RequestEvent) {
  console.error("[1] POST function called!");
  const { mainUrl, companyName } = await request.json();

  if (!mainUrl) {
    return new Response('Missing mainUrl', { status: 400 });
  }

  try {
    const urlObject = new URL(mainUrl);
    const baseDomain = urlObject.origin; // e.g., "https://www.example.com"
    //const companyName = urlObject.hostname; // Use hostname as default name e.g., www.example.com

    // 1. Insert the company into the 'companies' table
    const { error: companyInsertError, data: companyData } = await supabase
      .from('companies')
      .insert([{ name: companyName, domain: baseDomain }])
      .select('id');

    if (companyInsertError) {
      console.error(`Error inserting company:`, companyInsertError);
      return new Response(`Failed to insert company record: ${companyInsertError.message}`, { status: 500 });
    }

    const companyId = companyData[0].id;
    console.error(`Company record inserted with ID: ${companyId}`);

    // 2. Proceed with checking/inserting the page
    console.error(`Checking if main URL exists: ${mainUrl}`);
    const { data: existingPages, error: selectError } = await supabase
      .from('pages')
      .select('*')
      .eq('company_id', companyId)
      .eq('url', mainUrl);

    if (selectError) {
      console.error('Error checking if main URL exists:', selectError);
    } else if (existingPages && existingPages.length > 0) {
      console.error(`Main URL ${mainUrl} already exists, skipping insertion.`);
    } else {
      // Insert the main URL with depth 0 only if it wasn't found
      console.error(`Inserting main URL: ${mainUrl}`);
      const { error: pageInsertError } = await supabase
        .from('pages')
        .insert([{ company_id: companyId, url: mainUrl, depth: 0 }]);

      if (pageInsertError) {
        // This is where the original foreign key error likely happened.
        console.error(`Error inserting main URL page:`, pageInsertError);
        // Return an error response as the initial page couldn't be added.
        return new Response(`Failed to insert initial page: ${pageInsertError.message}`, { status: 500 });
      }
      console.error(`Main URL page inserted successfully.`);
    }

    console.error(`Calling crawlNext...`);
    // Start the crawling process asynchronously
    crawlNext(companyId, baseDomain);

    // Return a success response immediately
    // Consider returning JSON for consistency, even if simple
    return new Response(JSON.stringify({ message: 'Crawling process initiated successfully', companyId: companyId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Unexpected error in POST handler:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to start crawl', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
