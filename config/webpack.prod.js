const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {

    entry: {
      main: ["./src/app/bootstrap.js"]
    },
    mode: "production",
    output: {
      filename: "bundle.min.js",
      path: path.resolve(__dirname, "../dist"),
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader"
            }
          ]
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
          // use: ExtractTextPlugin.extract({
          //   fallback: "style-loader",
          //   use: {
          //     loader: "css-loader",
          //     options: {
          //       minimize: true
          //     }
          //   }
          // })
        },
        {
          test: /\.html$/,
          use: [
            { loader: "html-loader" }
          ]
        },
        {
          test: /\.html$/,
          use: [
                {
                    loader: "file-loader",
                    options: {
                        name: 'views/[name].[ext]'
                    }
                }
            ],
            exclude: path.resolve(__dirname, 'src/index.html')
        },
        {
          test: /\.(jepeg|jpg|gif|png)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "images/[name].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins: [
      //new ExtractTextPlugin("[name].css"),
      new MiniCssExtractPlugin({ filename: '[name].min.css' }),  // By default, it gives [name].css name
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require("cssnano"),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
      }),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: "production"
        }
      }),
      new HTMLWebpackPlugin({
        template: "./src/index.html",
        inject: true,
        title: "Webpack: AngularJS configuration"
      }),
      new webpack.ProvidePlugin({
          jQuery: 'jquery',
          $: 'jquery',
          jquery: 'jquery'
      })
    ]

};
