import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        danger: '#f44336',
        warning: '#ff9800',
        success: '#4caf50',
        info: '#2196f3',
      },
    },
  },
  plugins: [],
}
export default config
