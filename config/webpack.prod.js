/**
 * @author: @AngularClass
 */

const helpers = require('./helpers');
/**
 * Used to merge webpack configs
*/
const webpackMerge = require('webpack-merge');
const webpackMergeDll = webpackMerge.strategy({plugins: 'replace'});
/**
 * The settings that are common to prod and dev
*/
const commonConfig = require('./webpack.common.js');

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;

const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge(commonConfig({
  env: ENV
}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false
});

module.exports = function (env) {
  return webpackMerge(commonConfig({
    env: ENV
  }), {

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      // filename: '[name].[chunkhash].bundle.js',
      filename: '[name].js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[file].map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      //chunkFilename: '[name].[chunkhash].chunk.js'
      chunkFilename: 'chunk-[name].js'

    },

    module: {

      rules: [

        /**
         * Extract CSS files from .src/styles directory to external CSS file
         */
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          }),
          include: [helpers.root('src', 'styles')]
        },

        /**
         * Extract and compile SCSS files from .src/styles directory to external CSS file
         */
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader!sass-loader'
          }),
          include: [helpers.root('src', 'styles')]
        },

      ]

    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       *
       * NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
       */
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
        }
      }),

      new DllBundlesPlugin({
        bundles: {
          polyfills: [
            'core-js',
            {
              name: 'zone.js',
              path: 'zone.js/dist/zone.js'
            },
            {
              name: 'zone.js',
              path: 'zone.js/dist/long-stack-trace-zone.js'
            },
          ],
          vendor: [
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/core',
            '@angular/common',
            '@angular/forms',
            '@angular/http',
            '@angular/router',
            '@angularclass/hmr',
            'rxjs',
          ]
        },
        dllDir: helpers.root('dll'),
        webpackConfig: webpackMergeDll(commonConfig({env: ENV}), {
          devtool: 'cheap-module-source-map',
          plugins: []
        })
      }),

      /**
       * Plugin: AddAssetHtmlPlugin
       * Description: Adds the given JS or CSS file to the files
       * Webpack knows about, and put it into the list of assets
       * html-webpack-plugin injects into the generated html.
       *
       * See: https://github.com/SimenB/add-asset-html-webpack-plugin
       */
      new AddAssetHtmlPlugin([
        { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`) },
        { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`) }
      ]),

      new NormalModuleReplacementPlugin(/\.\/environment\.dev/, './environment.prod'),

      /**
       * Plugin: NamedModulesPlugin (experimental)
       * Description: Uses file names as module name.
       *
       * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
       */
      // new NamedModulesPlugin(),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new LoaderOptionsPlugin({
        debug: false,
        options: {

        }
      }),

    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  });
}
