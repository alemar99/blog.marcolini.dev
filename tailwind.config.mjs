import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f8f7',
          100: '#ddeae6',
          200: '#bbd4cd',
          300: '#91b7ae',
          400: '#6a978d',
          500: '#507c73',
          600: '#466e67',
          700: '#35504c',
          800: '#2d423e',
          900: '#293836',
          950: '#141f1e',
        }
      },

      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Lora", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
