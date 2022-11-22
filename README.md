# Webpack config for AngularJS

> This repo is already configured for AngularJS framework.

## Dependencies
* [GIT](https://git-scm.com/downloads)
* [Node JS](https://nodejs.org/en/download/current/)
* NPM (Node JS includes NPM)

## Install
In your terminal type following commands:

```bash
git clone https://github.com/DudkinON/webpack-angularjs.git
cd AngularJS-Webpack
```

then you need install packages:

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

After server is running you will see:

[![demo](https://github.com/DudkinON/webpack-angularjs/blob/master/demo.png?raw=true)](https://github.com/DudkinON/webpack-angularjs/blob/master/demo.png?raw=true)

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
