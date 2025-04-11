import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: [
		"dark",
		// Badge colors to safelist
		// Blue
		"border-blue-500", "bg-blue-100", "text-blue-700",
		"dark:border-blue-500", "dark:bg-blue-900/50", "dark:text-blue-200",
		// Purple
		"border-purple-500", "bg-purple-100", "text-purple-700",
		"dark:border-purple-500", "dark:bg-purple-900/50", "dark:text-purple-200",
		// Cyan
		"border-cyan-500", "bg-cyan-100", "text-cyan-700",
		"dark:border-cyan-500", "dark:bg-cyan-900/50", "dark:text-cyan-200",
		// Green
		"border-green-500", "bg-green-100", "text-green-700",
		"dark:border-green-500", "dark:bg-green-900/50", "dark:text-green-200",
		// Orange
		"border-orange-500", "bg-orange-100", "text-orange-700",
		"dark:border-orange-500", "dark:bg-orange-900/50", "dark:text-orange-200",
		// Grey (Default) - Already likely included but good to be explicit
		"border-gray-400", "bg-gray-100", "text-gray-700",
		"dark:border-gray-600", "dark:bg-gray-700/50", "dark:text-gray-300",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			}
		}
	},
};

export default config;
