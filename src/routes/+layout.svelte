<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

<header class="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
	<nav class="container mx-auto px-4 py-3 flex justify-between items-center">
		<a href="/" class="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
			InfrAi
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
