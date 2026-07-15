/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#b09060',
        card: 'rgba(110,85,42,0.72)',
        cream: '#f0e8d0',
        ink: '#1a120a',
        gold: '#d4a840',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        /* Body font over parchment — slab serif Bitter chosen for stroke
           weight and presence (Cormorant was too fine over #b09060). */
        garamond: ['Bitter', 'Georgia', 'serif'],
        /* Explicit alias when you need Cormorant's elegant italics
           (typically over the dark cover / inside .card). */
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        typewriter: ['"Special Elite"', '"Courier Prime"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};
