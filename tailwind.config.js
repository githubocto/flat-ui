module.exports = {
  purge: ['./src/**/*.tsx', './**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      lineClamp: {
        9: '9',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
