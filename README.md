# Webpack config for AngularJS

> This repo is already configured for AngularJS framework.

#### NOTE: When using it as a micro-frontend to another container App
```bash
1. We can successfully mount this AngularJs App to any container App of any tech stack.
The code for which is present inside `src/app/bootstrap.js` file where we first need to set the base url of the App to this AngularJS App origin.
In this App case, its localhost:8083. In prod/test environment, corresponding domain origin needs to be added there.

2. In this angularJs App, we should navigate to different routes programatically. Omit the use of ng-href from html, as that wont work in MF.
   Also, while doing programatic route change, base url needs to be changed first.
```

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
