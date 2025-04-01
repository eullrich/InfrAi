<script lang="ts">
	import type { PageData } from './$types';
	import type { CompanyWithInsights } from '$lib/types'; // Import the specific type
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js'; // Import Badge component
	// Button is no longer needed here unless we add other actions

	export let data: PageData;
	// Explicitly type the companies array for better type safety in the template
	$: companies = (data.companies as CompanyWithInsights[]) || [];
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
		<!-- Removed Admin Button - now in header -->
		<!-- Could add a call-to-action button here if needed, e.g., <Button href="#companies">Browse Companies</Button> -->
	</div>
</section>

<!-- Companies Grid Section -->
<section id="companies" class="py-16 md:py-24 bg-white dark:bg-gray-950">
	<div class="container mx-auto px-6">
		<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
			Featured Companies
		</h2>

		{#if companies.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{#each companies as company (company.id)}
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
									{#if company.offers_hosted_inference}
										<Badge variant="outline" class="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Hosted Inference</Badge>
									{/if}
									{#if company.offers_rentable_gpus}
										<Badge variant="outline" class="border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Rentable GPUs</Badge>
									{/if}
									{#if company.offers_finetuning_pipeline}
										<Badge variant="outline" class="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">Finetuning</Badge>
									{/if}
									{#if !company.offers_hosted_inference && !company.offers_rentable_gpus && !company.offers_finetuning_pipeline}
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
				<h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Companies Found</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">There are currently no companies listed in the database.</p>
				<!-- Optional: Link to Admin page to add companies -->
				<!-- <div class="mt-6">
					<Button href="/admin" variant="secondary">Add Company</Button>
				</div> -->
			</div>
		{/if}
	</div>
</section>
