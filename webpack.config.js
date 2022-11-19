const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: [
      "babel-runtime/regenerator",
      "babel-register",
      "webpack-hot-middleware/client?reload=true",
      "./src/app/main.js"
    ]
  },
  mode: "development",
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "./src/dist"),
    publicPath: "/"
  },
  devServer: {
    port: 8080,
    historyApiFallback: true
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: "babel-loader" }
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
