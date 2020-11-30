const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const WebpackNotifierPlugin = require('webpack-notifier')

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new WebpackNotifierPlugin({
      title: 'Node Starter Build',
      contentImage:
        'https://github.com/cds-snc/common-assets/raw/master/EN/cds-snc.png',
    }),
  ],
});