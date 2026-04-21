/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        sidebar: '#1e1e2e',
        'board-bg': '#f1f5f9',
        'column-bg': '#f8fafc',
        'card-bg': '#ffffff',
        'label-feature': '#3b82f6',
        'label-bug': '#ef4444',
        'label-issue': '#f59e0b',
        'label-undefined': '#6b7280',
      },
      spacing: {
        'sidebar-width': '206px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
