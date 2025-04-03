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
<section class="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-black py-20 md:py-32">
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmYWZhZmEiIG9wYWNpdHk9IjAuMSI+PC9yZWN0Pjwvc3ZnPg==')] opacity-50 dark:opacity-[0.03]"></div>
	<div class="container mx-auto px-6 text-center relative z-10">
		<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white leading-tight">
			Explore the AI Infrastructure Landscape
		</h1>
		<p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
			Discover and compare providers offering hosted inference, rentable GPUs, and fine-tuning solutions.
		</p>
	</div>
</section>

<!-- Companies Grid Section -->
<section id="companies" class="py-16 md:py-24 bg-white dark:bg-gray-950">
	<div class="container mx-auto px-6">
		<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
			Featured Companies
		</h2>

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
								? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 focus:ring-blue-500'
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
						<Card.Root class="flex flex-col h-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors duration-300">
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
										{#if company.offering_labels.includes('Hosted Inference')}
											<Badge variant="outline" class="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Hosted Inference</Badge>
										{/if}
										{#if company.offering_labels.includes('Rentable GPUs')}
											<Badge variant="outline" class="border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Rentable GPUs</Badge>
										{/if}
										{#if company.offering_labels.includes('Finetuning')}
											<Badge variant="outline" class="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">Finetuning</Badge>
										{/if}
									{:else}
										<p class="text-sm text-gray-500 dark:text-gray-400 italic">No specific offerings listed.</p>
									{/if}
								</div>
							</Card.Content>
							<Card.Footer class="mt-auto p-5 border-t border-gray-100 dark:border-gray-700/50">
								<span class="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
									View Details &rarr;
								</span>
							</Card.Footer>
						</Card.Root>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
