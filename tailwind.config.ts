import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface colors
        'surface': '#fff8f5',
        'surface-dim': '#ebd6c7',
        'surface-bright': '#fff8f5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fff1e8',
        'surface-container': '#ffeadb',
        'surface-container-high': '#fae4d5',
        'surface-container-highest': '#f4dfcf',
        'on-surface': '#241910',
        'on-surface-variant': '#5c4037',
        'inverse-surface': '#3a2e24',
        'inverse-on-surface': '#ffeee2',

        // Outline colors
        'outline': '#916f65',
        'outline-variant': '#e6beb2',
        'surface-tint': '#ae3200',

        // Primary colors
        'primary': '#aa3000',
        'on-primary': '#ffffff',
        'primary-container': '#d43f00',
        'on-primary-container': '#fffbff',
        'inverse-primary': '#ffb59e',

        // Secondary colors
        'secondary': '#4f6600',
        'on-secondary': '#ffffff',
        'secondary-container': '#bdf200',
        'on-secondary-container': '#526b00',

        // Tertiary colors
        'tertiary': '#635a55',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#7d736d',
        'on-tertiary-container': '#fffbff',

        // Error colors
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Fixed colors
        'primary-fixed': '#ffdbd0',
        'primary-fixed-dim': '#ffb59e',
        'on-primary-fixed': '#3a0b00',
        'on-primary-fixed-variant': '#852400',
        'secondary-fixed': '#c0f500',
        'secondary-fixed-dim': '#a8d700',
        'on-secondary-fixed': '#161f00',
        'on-secondary-fixed-variant': '#3b4d00',
        'tertiary-fixed': '#ede0d9',
        'tertiary-fixed-dim': '#d1c4bd',
        'on-tertiary-fixed': '#211a16',
        'on-tertiary-fixed-variant': '#4d4540',

        // Background
        'background': '#fff8f5',
        'on-background': '#241910',
        'surface-variant': '#f4dfcf',
      },
      fontFamily: {
        'display-lg': ['Syne', 'sans-serif'],
        'display-md': ['Syne', 'sans-serif'],
        'headline-lg': ['Syne', 'sans-serif'],
        'headline-lg-mobile': ['Syne', 'sans-serif'],
        'headline-md': ['Syne', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'label-lg': ['Inter', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'label-sm': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '1', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '1', fontWeight: '700' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
        'xxl': '64px',
        'margin-mobile': '16px',
        'margin-desktop': '48px',
        'gutter': '20px',
        'base': '4px',
      },
      borderRadius: {
        'none': '0',
        'DEFAULT': '2px',
        'sm': '2px',
        'lg': '4px',
        'xl': '8px',
        'full': '12px',
      },
      boxShadow: {
        'offset': '4px 4px 0px 0px #aa3000',
        'offset-hover': '6px 6px 0px 0px #aa3000',
      },
      backgroundImage: {
        'sunset-mesh': `
          radial-gradient(at 0% 0%, #ffdbd0 0px, transparent 50%),
          radial-gradient(at 100% 0%, #ffb59e 0px, transparent 50%),
          radial-gradient(at 100% 100%, #aa3000 0px, transparent 50%),
          radial-gradient(at 0% 100%, #ffdbd0 0px, transparent 50%)
        `,
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
