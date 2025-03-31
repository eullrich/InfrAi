import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: [
			'dequal',
			'nanoid/non-secure',
			'@internationalized/date',
			'@floating-ui/dom',
			'focus-trap'
		]
	}
});
