/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Academic Registry UI Design System Tokens
        'surface': '#fbf9f4',
        'surface-dim': '#dbdad5',
        'surface-bright': '#fbf9f4',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f3ee',
        'surface-container': '#f0eee9',
        'surface-container-high': '#eae8e3',
        'surface-container-highest': '#e4e2dd',
        'on-surface': '#1b1c19',
        'on-surface-variant': '#44474d',
        'inverse-surface': '#30312e',
        'inverse-on-surface': '#f2f1ec',
        'outline': '#75777e',
        'outline-variant': '#c4c6ce',
        'surface-tint': '#4d5f7d',
        'primary': '#000615',
        'on-primary': '#ffffff',
        'primary-container': '#0b1f3a',
        'on-primary-container': '#7587a7',
        'inverse-primary': '#b5c7ea',
        'secondary': '#515f76',
        'on-secondary': '#ffffff',
        'secondary-container': '#d5e3ff',
        'on-secondary-container': '#57657d',
        'secondary-fixed': '#d5e3ff',
        'secondary-fixed-dim': '#b9c7e2',
        'on-secondary-fixed': '#0d1c30',
        'on-secondary-fixed-variant': '#3a475e',
        'tertiary': '#000616',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#151f31',
        'on-tertiary-container': '#7d879d',
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Dark Canvas Extension
        darkcanvas: {
          bg: '#0B1424',
          surface: '#121C2F',
          border: '#1F2C45',
          text: '#FFFFFF',
          muted: '#8A99AD'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
