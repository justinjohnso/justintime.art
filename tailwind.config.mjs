/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: '#374151',
						lineHeight: '1.7',
						h1: {
							color: '#111827',
							fontWeight: '300',
							fontSize: '2.25rem',
							marginBottom: '1.5rem',
						},
						h2: {
							color: '#111827',
							fontWeight: '300',
							fontSize: '1.875rem',
							marginTop: '2rem',
							marginBottom: '1rem',
						},
						h3: {
							color: '#111827',
							fontWeight: '400',
							fontSize: '1.5rem',
							marginTop: '1.5rem',
							marginBottom: '0.75rem',
						},
						p: {
							marginBottom: '1rem',
						},
						a: {
							color: '#2563eb',
							textDecoration: 'underline',
							'&:hover': {
								color: '#1e40af',
							},
						},
					},
				},
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
