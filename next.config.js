const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');
const withFonts = require('nextjs-fonts');
const path = require('path')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
module.exports = withCSS(withSass(withFonts({
    enableSvg: true,
    //target: 'serverless',
    mode: 'production',
    webpack(config) {
        plugins: [
          new CaseSensitivePathsPlugin(),
          new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8
            })
          // other plugins ...
        ]
        config.module.rules.push({
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 100000,
                name: '[name].[ext]'
              }
            }
          });
          
          config.resolve.modules.push(path.resolve('./'))
    return config;
  }
  })));