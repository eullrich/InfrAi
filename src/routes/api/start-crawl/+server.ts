// src/routes/api/start-crawl/+server.ts
import { supabase } from '$lib/supabase.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { RequestEvent } from '@sveltejs/kit';

// Flag to prevent multiple crawls from running simultaneously
let crawling = false;

async function crawlNext(companyId: string | number): Promise<void> {
  if (crawling) return; // Skip if already crawling
  crawling = true;

  while (true) {
    // Fetch the next uncrawled page for this company
    const { data: pages, error } = await supabase
      .from('pages')
      .select('url')
      .eq('company_id', companyId)
      .is('raw_html', null) // Find pages that haven't been crawled yet
      .limit(1);

    if (error || pages.length === 0) {
      crawling = false; // Stop if no more pages or an error occurs
      break;
    }

    const url = pages[0].url;

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

      // Extract links within the same domain
      const links: string[] = [];
      $('a').each((i: number, elem: any) => {
        const href = $(elem).attr('href');
        if (href) {
          if (href.startsWith('/')) {
            // Relative URL
            links.push(new URL(href, url).href);
          } else if (href.startsWith(url)) {
            // Absolute URL within the same domain
            links.push(href);
          }
        }
      });

      // Insert new links into the database (ignoring duplicates)
      if (links.length > 0) {
        const newPages = links.map(link => ({ company_id: companyId, url: link }));
        await supabase.from('pages').insert(newPages).then(({ error }) => {
          if (error && error.code !== '23505') { // Ignore duplicate key errors (23505)
            console.error('Error inserting new pages:', error);
          }
        });
      }

      // Update the current page with crawled data
      await supabase
        .from('pages')
        .update({
          raw_html: html,
          parsed_text: parsedText,
          title,
          crawl_date: new Date().toISOString()
        })
        .eq('url', url);

      // Add a delay to avoid overwhelming the server or target website
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Failed to crawl ${url}:`, err);
      // Optionally mark the page as processed to avoid infinite loops
      await supabase
        .from('pages')
        .update({ crawl_date: new Date().toISOString() })
        .eq('url', url);
    }
  }
}

export async function POST({ request }: RequestEvent) {
  const { companyId, mainUrl } = await request.json();

  // Insert the main URL into the pages table (if not already present)
  await supabase
    .from('pages')
    .insert([{ company_id: companyId, url: mainUrl }])
    .then(({ error }) => {
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error inserting main URL:', error);
      }
    });

  // Start the crawling process in the background
  crawlNext(companyId);

  // Return a response immediately so the client isn't blocked
  return new Response('Crawling started', { status: 200 });
}
