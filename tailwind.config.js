/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // brand palette — keep minimal, refine later
        bg: '#0a0a0a',
        fg: '#f5f5f5',
        muted: '#737373',
        accent: '#ff4500', // reddit orange as a nod
      },
    },
  },
  plugins: [],
};
