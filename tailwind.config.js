/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Darker shades for board pieces (better visibility)
        'pink-piece': '#FF69B4', // Hot pink
        'yellow-piece': '#FFD700', // Gold
        'orange-piece': '#FF8C00', // Dark orange
        'purple-piece': '#9370DB', // Medium purple
        // Game board colors (with dark mode support)
        'board-bg': '#F5F5F5',
        'cell-level-1': '#E8F5E9',
        'cell-level-2': '#C8E6C9',
        'cell-level-3': '#A5D6A7',
        'cell-level-4': '#81C784',
        'cell-level-5': '#66BB6A',
        // UI component colors (with dark mode support)
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        primary: {
          DEFAULT: 'hsl(222.2 47.4% 11.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        accent: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(222.2 84% 4.9%)',
      },
    },
  },
  plugins: [],
}
