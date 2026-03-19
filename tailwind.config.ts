import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0c0c0c',
        accent: '#E5FE3D',
        lagom: '#3DB8E4',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
