
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
	},
	server: {
		host: true,
		strictPort: true,
		port: 5173,
		allowedHosts: ['152de8af-d701-4f6c-bf5a-02a5339bb09d-00-3fbl3xkh4xqij.kirk.replit.dev']
	}
});
