module.exports = {
  purge: ['./src/**/*.tsx', './**/*.tsx', './src/store.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      lineClamp: {
        9: '9',
      },
      cursor: {
        "cell": "cell",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
