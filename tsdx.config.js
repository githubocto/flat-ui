const postcss = require('rollup-plugin-postcss');

module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [require('tailwindcss'), require('autoprefixer')],
        inject: true,
      })
    );
    return config; // always return a config.
  },
};
