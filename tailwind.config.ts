import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        chaptr: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          faint: 'var(--faint)',
          accent: 'var(--accent)',
        },
        trust: {
          high: '#166534',
          medium: '#92400E',
          low: '#991B1B',
          uncertain: '#4B5563',
        },
        category: {
          positive: '#0F6E56',
          negative: '#993C1D',
          trust: '#534AB7',
          neutral: '#5F5E5A',
        },
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      borderRadius: {
        card: '10px',
        pill: '8px',
        btn: '6px',
      },
    },
  },
  plugins: [],
};
export default config;

