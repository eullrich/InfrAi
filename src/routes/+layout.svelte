<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

<svelte:head>
	<title>WTF Infra Directory | Understand tech companies at a glance</title>
	<meta name="description" content="Stop digging. Quickly understand what companies offer for AI, Web3, and beyond." />
</svelte:head>

<header class="bg-white dark:bg-gray-900 border-b border-blue-600/30 dark:border-blue-400/30 sticky top-0 z-50"> <!-- Replaced shadow with themed border -->
	<nav class="container mx-auto px-4 py-3 flex justify-between items-center">
		<a href="/" class="text-2xl font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
			WTF Infra
		</a>
		<!-- Admin Link -->
		<a href="/admin" class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
			Admin
		</a>
	</nav>
</header>

<main class="pt-4"> <!-- Add some padding top to avoid content hiding behind sticky header -->
	<Toaster />
	{@render children()}
</main>
