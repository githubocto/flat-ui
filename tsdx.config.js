const postcss = require('rollup-plugin-postcss');

module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [require('tailwindcss'), require('autoprefixer')],
        // inject: false,
        // // only write out CSS for the first bundle (avoids pointless extra files):
        // extract: !!options.writeMeta,
      })
    );
    return config; // always return a config.
  },
};
