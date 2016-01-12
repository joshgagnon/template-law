var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack");
var path = require('path')
module.exports = {
    entry: "./assets/js/app.js",
    cache: true,
    output: {
        path:  path.resolve(__dirname, 'public'),
        filename: "bundle.js"
    },
    node: {
        __dirname: true,
        fs: 'empty'
    },
    devtool: 'source-map',
    module: {
        loaders: [

            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015', "stage-0"]
                }
            },   /*         {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015', "stage-0"]
                }
            },*/ {
            test: /\.(scss|css)$/,
            loader: ExtractTextPlugin.extract(
                // activate source maps via loader query
                'css?sourceMap!' +
                'sass?sourceMap'
            )
            }, {
                test: /\.html$/, loader: "handlebars-loader"
            }, {
                test: /\.json$/, loader: "json-loader"
            }, /*   {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader'
            }*/, {
                test: /\.(svg|woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=[name].[ext]"
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
         { from: 'assets/images', to: 'images' },
         ]),
        new ExtractTextPlugin('styles.css'),
        new webpack.optimize.DedupePlugin()
    ],
      resolve: {
        modulesDirectories: ['node_modules', 'src'],
        fallback: path.join(__dirname, 'node_modules'),
        alias: {
          'handlebars': 'handlebars/runtime.js'
        }
      },
      resolveLoader: {
        fallback: path.join(__dirname, 'node_modules'),
        alias: {
          'hbs': 'handlebars-loader'
        }
  },
};