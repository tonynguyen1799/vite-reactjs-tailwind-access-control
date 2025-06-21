export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			keyframes: {
				slideIn: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideOut: {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-100%)', opacity: '0' },
				},
				'fade-in-up': {
					'0%': { opacity: 0, transform: 'translateY(10px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
			},
			animation: {
				slideIn: 'slideIn 0.4s ease-out both',
				slideOut: 'slideOut 0.3s ease-in both',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
			},
		},
	},
	plugins: [],
};