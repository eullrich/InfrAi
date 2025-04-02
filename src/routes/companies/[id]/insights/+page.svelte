<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js'; // Keep for the "Generate Insights" button
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation'; // Import invalidateAll

	export let data: PageData;

	// Helper function to format boolean flags
	function formatBoolean(value: boolean | null | undefined): string {
		if (value === true) return 'Yes';
		if (value === false) return 'No';
		return 'N/A';
	}

	// Helper to format dates nicely
	function formatDate(dateString: string | undefined | null): string {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleString();
		} catch (e) {
			return 'Invalid Date';
		}
	}

	// Helper function to get appropriate badge variant based on boolean value
	function getBooleanBadgeVariant(value: boolean | null | undefined): 'secondary' | 'outline' {
		return value === true ? 'secondary' : 'outline';
	}

	// Helper function to get appropriate badge color class based on boolean value
	function getBooleanBadgeClass(value: boolean | null | undefined): string {
		if (value === true) return 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300';
		if (value === false) return 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300';
		return 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300'; // N/A style
	}

</script>

<!-- Hero Section - Styled like homepage -->
<section class="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-black py-16 md:py-24">
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmYWZhZmEiIG9wYWNpdHk9IjAuMSI+PC9yZWN0Pjwvc3ZnPg==')] opacity-50 dark:opacity-[0.03]"></div>
	<div class="container mx-auto px-6 text-center relative z-10">
		<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-white leading-tight">
			{#if data.company?.name}
				{data.company.name}
			{:else}
				AI Infrastructure Company
			{/if}
		</h1>

		{#if data.insights?.tagline}
			<p class="text-lg md:text-xl text-indigo-700 dark:text-indigo-300 font-medium mt-1 mb-6 max-w-3xl mx-auto">
				"{data.insights.tagline}"
			</p>
		{/if}

		<!-- Website and Social Links -->
		<div class="flex justify-center items-center space-x-3 mt-8">
			{#if data.company?.domain}
				{@const websiteUrl = data.company.domain.startsWith('http') ? data.company.domain : `https://${data.company.domain}`}
				<a
					href={websiteUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-full text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
					title="Visit Website"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd" />
					</svg>
					<span class="ml-1.5 hidden sm:inline">Website</span>
				</a>
			{/if}

			{#if data.insights?.x_url}
				<a
					href={data.insights.x_url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center h-9 w-9 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
					title="Visit X Profile"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
				</a>
			{/if}

			{#if data.insights?.linkedin_url}
				<a
					href={data.insights.linkedin_url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center h-9 w-9 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
					title="Visit LinkedIn Profile"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
					</svg>
				</a>
			{/if}
		</div>
	</div>
</section>

<!-- Main Content Area -->
<section class="py-16 md:py-24 bg-white dark:bg-gray-950">
	<div class="container mx-auto px-6">
		<!-- Removed the empty navigation tabs div -->

		{#if data.insights}
			<!-- Main content grid -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

				<!-- Left column -->
				<div class="lg:col-span-1 space-y-8">
					<!-- Overview Card -->
					<Card.Root class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
							<Card.Title class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
								</svg>
								Company Overview
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5 space-y-4">
							{#if data.insights.mission}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Mission</h4>
									<p class="text-sm text-gray-700 dark:text-gray-300">{data.insights.mission}</p>
								</div>
							{/if}
							{#if data.insights.target_audience}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Target Audience</h4>
									<p class="text-sm text-gray-700 dark:text-gray-300">{data.insights.target_audience}</p>
								</div>
							{/if}
							{#if !data.insights.mission && !data.insights.target_audience}
								<p class="text-sm text-gray-500 dark:text-gray-400 italic">No overview details available.</p>
							{/if}
						</Card.Content>
					</Card.Root>

					<!-- Product Categories Card -->
					<Card.Root class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
							<Card.Title class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clip-rule="evenodd" />
								</svg>
								Product Categories
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5">
							<div class="space-y-3">
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
									<div class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
										<div class="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2.5 flex-shrink-0"></div>
										Hosted Inference
									</div>
									<Badge variant={getBooleanBadgeVariant(data.insights.offers_hosted_inference)} class={getBooleanBadgeClass(data.insights.offers_hosted_inference)}>
										{formatBoolean(data.insights.offers_hosted_inference)}
									</Badge>
								</div>
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
									<div class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
										<div class="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2.5 flex-shrink-0"></div>
										Rentable GPUs
									</div>
									<Badge variant={getBooleanBadgeVariant(data.insights.offers_rentable_gpus)} class={getBooleanBadgeClass(data.insights.offers_rentable_gpus)}>
										{formatBoolean(data.insights.offers_rentable_gpus)}
									</Badge>
								</div>
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
									<div class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
										<div class="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2.5 flex-shrink-0"></div>
										Finetuning Pipeline
									</div>
									<Badge variant={getBooleanBadgeVariant(data.insights.offers_finetuning_pipeline)} class={getBooleanBadgeClass(data.insights.offers_finetuning_pipeline)}>
										{formatBoolean(data.insights.offers_finetuning_pipeline)}
									</Badge>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Right column -->
				<div class="lg:col-span-2 space-y-8">
					<!-- Service Offerings Card -->
					<Card.Root class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
							<Card.Title class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
								</svg>
								Service Offerings
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5">
							{#if data.insights.service_offerings && data.insights.service_offerings.length > 0}
								<div class="space-y-4">
									{#each data.insights.service_offerings as service, i}
										<div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
											<h4 class="text-md font-semibold mb-1.5 text-gray-800 dark:text-gray-100">
												{service.name || 'Unnamed Service'}
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
												{service.description || 'No description available.'}
											</p>
											{#if service.tags && service.tags.length > 0}
												<div class="flex flex-wrap gap-2">
													{#each service.tags as tag}
														<Badge variant="outline" class="border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
															{tag}
														</Badge>
													{/each}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-10 text-gray-500 dark:text-gray-400">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									</svg>
									<p class="text-sm">No service offerings identified.</p>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>

					<!-- Strategy & Market Position Card -->
					<Card.Root class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
							<Card.Title class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
								</svg>
								Strategy & Market Position
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5 space-y-5">
							{#if data.insights.key_differentiators && data.insights.key_differentiators.length > 0}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Key Differentiators</h4>
									<ul class="space-y-2">
										{#each data.insights.key_differentiators as diff}
											<li class="flex items-start">
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
												</svg>
												<span class="text-sm text-gray-700 dark:text-gray-300">{diff}</span>
											</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if data.insights.technology_overview}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Technology Overview</h4>
									<div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
										<p class="text-sm text-gray-700 dark:text-gray-300">{data.insights.technology_overview}</p>
									</div>
								</div>
							{/if}

							{#if data.insights.partnerships && data.insights.partnerships.length > 0}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Partnerships</h4>
									<div class="flex flex-wrap gap-2">
										{#each data.insights.partnerships as partner}
											<Badge variant="outline" class="border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-xs">
												{partner}
											</Badge>
										{/each}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>

					<!-- Customers & Pricing Card -->
					<Card.Root class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="border-b border-gray-100 dark:border-gray-700/50 p-5">
							<Card.Title class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
									<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
								</svg>
								Customers & Pricing
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5 space-y-5">
							{#if data.insights.known_customers && data.insights.known_customers.length > 0}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Known Customers</h4>
									<div class="flex flex-wrap gap-2">
										{#each data.insights.known_customers as customer}
											<Badge variant="outline" class="border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-xs">
												{customer}
											</Badge>
										{/each}
									</div>
								</div>
							{:else}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Known Customers</h4>
									<p class="text-sm text-gray-500 dark:text-gray-400 italic">No customer information identified.</p>
								</div>
							{/if}

							{#if data.insights.pricing_overview}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Pricing Overview</h4>
									<div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
										<p class="text-sm text-gray-700 dark:text-gray-300">{data.insights.pricing_overview}</p>
									</div>
								</div>
							{:else}
								<div>
									<h4 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Pricing Overview</h4>
									<p class="text-sm text-gray-500 dark:text-gray-400 italic">No pricing information identified.</p>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<!-- Metadata Footer -->
			<div class="mt-16 border-t border-gray-200 dark:border-gray-700/50 pt-8 text-xs text-gray-500 dark:text-gray-400">
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					<div>
						<strong class="font-medium text-gray-600 dark:text-gray-300">Generated:</strong> {formatDate(data.insights.processed_at)}
					</div>
					<div>
						<strong class="font-medium text-gray-600 dark:text-gray-300">Model:</strong> {data.insights.llm_model_used ?? 'N/A'}
					</div>
					{#if data.insights.source_page_ids && data.insights.source_page_ids.length > 0}
						<div>
							<strong class="font-medium text-gray-600 dark:text-gray-300">Sources:</strong> {data.insights.source_page_ids.length} pages
						</div>
					{/if}
				</div>
			</div>

		{:else}
			<!-- Insights Not Generated State - Styled like homepage empty state -->
			<div class="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
				<h3 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Insights Not Generated</h3>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
					Company insights have not been generated yet. You can generate them now to analyze this company's offerings.
				</p>
				<form
					method="POST"
					action="/api/companies/{data.companyId}/process-insights"
					class="mt-6"
					use:enhance={({ formElement, formData, action, cancel }) => {
						// This function runs *before* the request is sent

						// Temporary store for promise handlers
						let resolvePromise: (value: Response | PromiseLike<Response>) => void;
						let rejectPromise: (reason?: any) => void;

						// Create the promise that toast.promise will track
						const promise = new Promise<Response>((resolve, reject) => {
							resolvePromise = resolve;
							rejectPromise = reject;
						});

						// Show the loading toast immediately
						toast.promise(promise, {
							loading: 'Generating insights...',
							success: (res) => {
								// Optional: Invalidate data after success to refresh the page content
								// invalidateAll();
								return `Insights generation started successfully!`;
							},
							error: (err) => {
								// Safely access error message
								const message = err instanceof Error ? err.message : String(err);
								return `Error starting insights generation: ${message || 'Unknown error'}`;
							}
						});

						// Return the callback that runs *after* the request completes
						return async ({ result, update }) => {
							// Resolve or reject the promise based on the fetch result
							if (result.type === 'success' || result.type === 'redirect') {
								// Use a generic success response for the toast
								resolvePromise(new Response('Success', { status: result.status }));
							} else if (result.type === 'error') {
								rejectPromise(result.error);
							} else if (result.type === 'failure') {
								// Handle potential validation errors or other failures from ActionResult
								const message = (result.data as { message?: string })?.message || 'Form submission failed';
								rejectPromise(new Error(message));
							} else {
								// Fallback for unexpected result types
								rejectPromise(new Error('Unknown form submission result'));
							}

							// Allow SvelteKit to update the page normally after the toast logic runs.
							// If you called invalidateAll() in success, this might cause a refresh.
							await update();
						};
					}}
				>
					<Button type="submit" size="lg">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
						</svg>
						Generate Insights
					</Button>
				</form>
				<p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
					Alternatively, view the <a href="/companies/{data.companyId}/scraped-data" class="text-blue-600 hover:underline dark:text-blue-400">Scraped Data page</a> first.
				</p>
			</div>
		{/if}
	</div>
</section>
