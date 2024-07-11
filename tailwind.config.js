module.exports = {
  content: [
    './_layouts/**/*.html',
    './_includes/**/*.html',
    './_posts/**/*.md',
    './_docs/**/*.md',
    './_projects/**/*.md',
    './_pages/**/*.md',
    './index.html',
    './404.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#5A67D8',
          DEFAULT: '#4C51BF',
          dark: '#434190',
        },
        secondary: {
          light: '#63B3ED',
          DEFAULT: '#4299E1',
          dark: '#3182CE',
        },
        accent: {
          light: '#F56565',
          DEFAULT: '#E53E3E',
          dark: '#C53030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
  },
}
