const path = require("path");
const webpack = require("webpack");
const packageJson = require('./package.json');
const HTMLWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  entry: {
    main: [
      // "babel-runtime/regenerator",
      // "babel-register",
      // "webpack-hot-middleware/client?reload=true",
      "./src/index.js"
    ]
  },
  mode: "development",
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "./src/dist"),
    publicPath: "http://localhost:8083/"
  },
  devServer: {
    port: 8083,
    historyApiFallback: true,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
              loader: "babel-loader",
              options: {
                presets: ['babel-preset-env'],
                plugins: ['babel-plugin-transform-runtime', 'syntax-dynamic-import'],
              }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
          // {
          //     loader: "file-loader",
          //     options: {
          //       name: "[name].[ext]"
          //     }
          // }
        ]
      },
      {
        test: /\.sass$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          { loader: "stylus-loader" }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "less-loader" }
        ]
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
      },
      {
        test: /\.html$/,
        use: [
              {
                  loader: "html-loader"
              }
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
        test: /\.pug$/,
        use: [
          { loader: "pug-loader" }
        ]
      },
      {
        test: /\.hbs$/,
        use: [
          {
            loader: "handlebars-loader",
            options: {
              inlineRequires: "/images/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
      new ModuleFederationPlugin({
          name: 'events',
          filename: 'remoteEntry.js',
          exposes: {
              './EventsApp': './src/app/bootstrap'
          },
          shared: packageJson.dependencies
      }),
    new webpack.HotModuleReplacementPlugin(),
    new HTMLWebpackPlugin({
      template: "./src/index.html",
      title: "Webpack: AngularJS Configuration"
    }),
    new webpack.ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        jquery: 'jquery'
    })
  ]
};
