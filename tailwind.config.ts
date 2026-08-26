import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        'ink-soft': '#1a1a1a',
        paper: '#ffffff',
        'paper-2': '#f7f7f5',
        'paper-3': '#efefec',
        line: '#e7e7e4',
        'line-2': '#d6d6d2',
        muted: '#6b6b6b',
        'muted-2': '#9a9a9a',
        accent: '#ff3b1f'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', '"Source Han Serif SC"', '"Noto Serif SC"', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'Menlo', 'monospace']
      },
      maxWidth: {
        container: '1320px'
      },
      borderRadius: {
        DEFAULT: '14px',
        lg: '22px'
      },
      letterSpacing: {
        tightish: '-0.02em'
      }
    }
  },
  plugins: []
};

export default config;
