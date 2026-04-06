/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
