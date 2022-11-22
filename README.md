# Webpack config for AngularJS

> This repo is already configured for AngularJS framework.

##### Install with NPM
```bash
npm install
```
##### Install with NPM
```bash
yarn install
```

## Run

run server:

```
npm run start
```

server will run on [http://127.0.0.1:8083](http://127.0.0.1:8083)

> Node: by default server uses port 8083, make sure that this port is free

## HTML preprocessors

This part discusses how to use HTML preprocessors

Open `webpack.config.js` file and find:

```
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HTMLWebpackPlugin({
      template: "./src/index.html",
      title: "Webpack: AngularJS configuration"
    })
  ]
```

## Angular.js entry point

Angular JS application files located in `src/app`. The `index.js` is the entry point for AngularJS app.

## License

This repo sharing under [MIT](LICENSE) license
