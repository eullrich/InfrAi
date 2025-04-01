<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner'; // Assuming svelte-sonner is used for toasts

	export let data: PageData;
	export let form: ActionData;

	let scrapingStates: { [key: string]: boolean } = {}; // Track loading state per company
	
	// Helper function to format dates
	function formatDate(dateString: string | null | undefined): string {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleString();
		} catch (e) {
			return 'Invalid Date';
		}
	}
	
	let companies = data.companies || [];

	async function startScrape(companyName: string, domain: string | null) {
		if (!domain) {
			toast.error(`Cannot scrape ${companyName}: Company domain is missing.`);
			return;
		}

		// Ensure domain is a full URL
		let mainUrl = domain;
		if (!mainUrl.startsWith('http://') && !mainUrl.startsWith('https://')) {
			mainUrl = `https://${mainUrl}`;
		}

		// Find companyId based on name (less ideal, but necessary if not passed)
		// A better approach might be to pass companyId directly if available easily
		const company = companies.find(c => c.name === companyName);
		if (!company) {
			toast.error(`Cannot find company ID for ${companyName}`);
			return;
		}
		const companyId = company.id;


		scrapingStates = { ...scrapingStates, [companyId]: true };

		try {
			const response = await fetch('/api/start-crawl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ mainUrl, companyName }) // Send mainUrl and companyName
			});

			// Check if the response is JSON before parsing
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.indexOf("application/json") !== -1) {
				const result = await response.json();
				if (response.ok) {
					toast.success(`Scraping started for ${companyName}. Job ID: ${result.companyId}`); // Use companyId from response if available
				} else {
					toast.error(`Failed to start scraping for ${companyName}: ${result.details || result.error || 'Unknown API error'}`);
				}
			} else {
				// Handle non-JSON responses (like the plain text error)
				const textResult = await response.text();
				toast.error(`Failed to start scraping for ${companyName}: ${response.statusText} - ${textResult}`);
			}

		} catch (error: any) {
			console.error('Error starting scrape:', error);
			toast.error(`Error starting scrape for ${companyName}: ${error.message}`);
		} finally {
			scrapingStates = { ...scrapingStates, [companyId]: false };
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Admin Dashboard</h1>
		<Button href="/" variant="outline">Back to Home</Button>
	</div>

	<!-- Add new company form -->
	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Add New Company</Card.Title>
			<Card.Description>Enter the details of the company you want to add</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/addCompany" use:enhance class="space-y-4">
				{#if form?.message}
					<div class="{form?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-3 rounded mb-4">
						{form.message}
					</div>
				{/if}
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="name" class="text-sm font-medium">Company Name*</label>
						<Input type="text" id="name" name="name" placeholder="e.g. AI Solutions Inc." value={form?.name || ''} required />
					</div>
					
					<div class="space-y-2">
						<label for="domain" class="text-sm font-medium">Website Domain</label>
						<Input type="text" id="domain" name="domain" placeholder="e.g. example.com" value={form?.domain || ''} />
					</div>
				</div>
				
				<div class="flex justify-end">
					<Button type="submit">Add Company</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
	
	<!-- Companies Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Companies</Card.Title>
			<Card.Description>Manage existing companies and their insights</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if companies.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="border-b">
								<th class="text-left p-3">Company</th>
								<th class="text-left p-3">Actions</th>
								<th class="text-left p-3">Content Generation</th>
								<th class="text-left p-3">Model Used</th>
								<th class="text-center p-3">Operations</th>
								<th class="text-center p-3">Scrape</th> 
							</tr>
						</thead>
						<tbody>
							{#each companies as company}
								{@const insights = Array.isArray(company.company_insights) ? company.company_insights[0] : company.company_insights}
								<tr class="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
									<td class="p-3">
										<div class="font-medium">{company.name}</div>
										{#if company.domain}
											<div class="text-sm text-gray-500">{company.domain}</div>
										{/if}
									</td>
									<td class="p-3">
										<div class="flex space-x-2">
											<Button href="/companies/{company.id}/insights" variant="outline" size="sm">
												View Insights
											</Button>
											<Button href="/companies/{company.id}/scraped-data" variant="outline" size="sm">
												Raw Data
											</Button>
										</div>
									</td>
									<td class="p-3">
										{#if insights?.processed_at}
											<div class="font-medium">{formatDate(insights.processed_at)}</div>
										{:else}
											<div class="text-gray-500">Not generated</div>
										{/if}
									</td>
									<td class="p-3">
										{#if insights?.llm_model_used}
											<Badge variant="outline">{insights.llm_model_used}</Badge>
										{:else}
											<span class="text-gray-500">-</span>
										{/if}
									</td>
									<td class="p-3 text-center">
										<form method="POST" action="/api/companies/{company.id}/process-insights" class="inline-block">
											<Button type="submit" variant="outline" size="sm">
												{insights ? 'Regenerate Insights' : 'Generate Insights'}
											</Button>
										</form>
									</td>
									<td class="p-3 text-center">
										<Button 
											variant="secondary"
											size="sm"
											on:click={() => startScrape(company.name, company.domain)}
											disabled={scrapingStates[company.id]}
										>
											{scrapingStates[company.id] ? 'Scraping...' : 'Scrape'}
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-12 text-gray-500">
					<p>No companies found. Add a company to get started.</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
