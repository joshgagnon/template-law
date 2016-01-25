var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack");
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var DEV = process.env.NODE_ENV !=='production';


module.exports = {
    entry: {
        app: "./assets/js/app.js",
    },
    cache: true,
    output: {
        path:  path.resolve(__dirname, 'public'),
        filename: DEV ? "[name].js" : "[name].[hash].js"
    },
    node: {
        __dirname: true,
        fs: 'empty'
    },
    devtool: DEV ? 'source-map' : false,
    module: {
        loaders: [

            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015', "stage-0"]
                }
            }, {
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

        new ExtractTextPlugin('[name].[hash].css'),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-nz/),
        new webpack.optimize.DedupePlugin(),
        function() {
            if(!DEV){
                this.plugin("done", function(stats) {
                  require("fs").writeFileSync(
                    path.join(__dirname, "stats.json"),
                    JSON.stringify(stats.toJson().assetsByChunkName));
                });
            }
        },
        !DEV ? new CleanWebpackPlugin(['public'], {
          verbose: true,
          dry: false
        }) : function() {}
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
