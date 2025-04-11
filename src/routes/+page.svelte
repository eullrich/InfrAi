<script lang="ts">
	import type { PageData } from './$types';
	import type { CompanyWithInsights } from '$lib/types'; // Import the specific type
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js'; // Keep Badge import for card content
	import { Button } from '$lib/components/ui/button/index.js'; // Import Button for filters
	import { setContext } from 'svelte'; // Not needed here

	export let data: PageData;

	// Reactive state for selected filter tags
	let selectedTags = new Set<string>();

	// Reactive derivations based on data prop
	$: uniqueTags = data?.uniqueTags || [];
	$: companies = (data?.companies as CompanyWithInsights[]) || [];
	$: filteredCompanies = companies.filter((company: CompanyWithInsights) => { // Added explicit type
		if (selectedTags.size === 0) {
			return true; // Show all if no tags are selected
		}
		// Check if the company has ALL selected tags
		// Ensure company.offering_labels exists before checking
		const companyLabels = new Set(company.offering_labels || []); // Use offering_labels
		for (const selectedTag of selectedTags) {
			if (!companyLabels.has(selectedTag)) { // Check against companyLabels
				return false; // Hide if any selected tag is missing
			}
		}
		return true; // Show if all selected tags are present
	});

	// Function to toggle a tag in the selected set
	function toggleTag(tag: string) {
		if (selectedTags.has(tag)) {
			selectedTags.delete(tag);
		} else {
			selectedTags.add(tag);
		}
		// Trigger reactivity by reassigning the set (important!)
		selectedTags = new Set(selectedTags); 
	}
</script>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/20 dark:from-blue-900/50 dark:via-purple-900/40 dark:to-cyan-900/50 py-16 md:py-24">
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmYWZhZmEiIG9wYWNpdHk9IjAuMSI+PC9yZWN0Pjwvc3ZnPg==')] opacity-50 dark:opacity-[0.03]"></div>
	<div class="container mx-auto px-6 text-center relative z-10">
		<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white leading-tight">
			WTF Infra Directory
		</h1>
		<p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
			Stop digging. Quickly understand what companies offer for AI, Web3, and beyond.
		</p>
	</div>
</section>

<!-- Companies Grid Section -->
<section id="companies" class="py-16 md:py-24 bg-white dark:bg-gray-950">
	<div class="container mx-auto px-6">

		<!-- Filter Section - Redesigned -->
		{#if uniqueTags.length > 0}
			<div class="mb-12"> 
				<h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 text-center md:text-left">Filter by Category:</h3>
				<div class="flex flex-wrap justify-center md:justify-start gap-2"> 
					{#each uniqueTags as tag (tag)}
						<button
							type="button"
							on:click={() => toggleTag(tag)}
							class="px-3 py-1 text-sm rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 {selectedTags.has(tag)
								? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md' // Stronger active state
								: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:ring-gray-400'}"
						>
							{tag}
						</button>
					{/each} 
				</div>
				{#if selectedTags.size > 0}
					<button 
						on:click={() => selectedTags = new Set()}
						class="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400 dark:hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 block mx-auto md:mx-0 md:inline-block"
					>
						Clear Filters
					</button>
				{/if}
			</div>
		{/if}

		<!-- Display Companies -->
		{#if filteredCompanies.length > 0} 
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{#each filteredCompanies as company (company.id)} 
					<a href="/companies/{company.id}/insights" class="group block rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950">
						<Card.Root class="flex flex-col h-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors duration-300"> 
							<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
								<Card.Title class="text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate" title={company.name || 'Unnamed Company'}>
									{company.name || 'Unnamed Company'}
								</Card.Title>
								{#if company.tagline}
									<Card.Description class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={company.tagline}>
										{company.tagline}
									</Card.Description>
								{/if}
							</Card.Header>
							<Card.Content class="flex-grow p-5">
								<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">Key Offerings</h4>
								<div class="flex flex-wrap gap-2">
									{#if company.offering_labels && company.offering_labels.length > 0}
										{#each company.offering_labels as label (label)}
											<!-- Harmonized Badge Colors -->
											{#if label === 'Hosted Inference' || label === 'RPC'}
												<Badge variant="outline" class="border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-200 font-medium">{label}</Badge>
											{:else if label === 'Rentable GPUs' || label === 'Virtual Private Server'}
												<Badge variant="outline" class="border-purple-500 bg-purple-100 text-purple-700 dark:border-purple-600 dark:bg-purple-900/40 dark:text-purple-200 font-medium">{label}</Badge>
											{:else if label === 'Finetuning'}
												<Badge variant="outline" class="border-cyan-500 bg-cyan-100 text-cyan-700 dark:border-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-200 font-medium">{label}</Badge>
											{:else}
												<!-- Default badge style using a neutral theme color -->
												<Badge variant="outline" class="border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-600 dark:bg-sky-900/40 dark:text-sky-200 font-medium">{label}</Badge>
											{/if}
										{/each}
									{:else}
										<p class="text-sm text-gray-500 dark:text-gray-400 italic">No specific offerings listed.</p>
									{/if}
								</div>
							</Card.Content>
							<Card.Footer class="mt-auto p-5 border-t border-gray-100 dark:border-gray-700/50">
								<span class="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:underline"> <!-- Bolder font, adjusted hover color -->
									View Details &rarr;
								</span>
							</Card.Footer>
						</Card.Root>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
				<!-- Updated Icon -->
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
					{#if selectedTags.size > 0}
						No Companies Match Filters
					{:else}
						No Companies Found
					{/if}
				</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{#if selectedTags.size > 0}
						Try adjusting your filters or clear them to see all companies.
					{:else}
						There are currently no companies listed in the database.
					{/if}
				</p>
				{#if selectedTags.size > 0}
					<div class="mt-6">
						<Button on:click={() => selectedTags = new Set()} variant="secondary">Clear Filters</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>
