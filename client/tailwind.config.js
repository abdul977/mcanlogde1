/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mcan: {
          primary: '#006400', // Deep Islamic green
          secondary: '#008000', // Medium green
          light: '#90EE90', // Light green
          accent: '#004d00', // Darker green for accents
        },
      },
      backgroundImage: {
        'gradient-mcan': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      gradientColorStops: {
        'mcan-gradient': ['#006400', '#008000', '#90EE90'],
      },
    },
  },
  plugins: [],
};
