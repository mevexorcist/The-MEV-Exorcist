import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cyber-horror theme colors
        'void-black': '#000000',
        'blood-red': '#FF0000',
        'matrix-green': '#00FF00',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { 
            transform: 'translate(0)',
            textShadow: '2px 2px #FF0000, -2px -2px #00FF00',
          },
          '25%': { 
            transform: 'translate(-2px, 2px)',
            textShadow: '-2px -2px #FF0000, 2px 2px #00FF00',
          },
          '50%': { 
            transform: 'translate(2px, -2px)',
            textShadow: '2px -2px #FF0000, -2px 2px #00FF00',
          },
          '75%': { 
            transform: 'translate(-2px, -2px)',
            textShadow: '-2px 2px #FF0000, 2px -2px #00FF00',
          },
        },
        'pulse-border': {
          '0%, 100%': { 
            borderColor: '#FF0000',
            boxShadow: '0 0 5px #FF0000, 0 0 10px #FF0000',
          },
          '50%': { 
            borderColor: '#FF6666',
            boxShadow: '0 0 10px #FF0000, 0 0 20px #FF0000, 0 0 30px #FF0000',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
