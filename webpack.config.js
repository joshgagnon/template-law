var webpack = require("webpack");
var path = require('path')
module.exports = {
    entry: "./assets/js/app.js",
    cache: true,
    output: {
        path: __dirname,
        filename: "./public/bundle.js"
    },
    node: {
        __dirname: true,
        fs: 'empty'
    },
    module: {
        loaders: [

            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015']
                }
            }, {
                test: /\.(scss|css)$/,
                loaders: ["style", "css?sourceMap", "sass?sourceMap"]
            }, {
                test: /\.html$/, loader: "handlebars-loader"
            }, {
                test: /\.json$/, loader: "json-loader"
            }
        ]
    },
    plugins: [
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
    devtool: 'source-map'
};