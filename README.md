# react-webpack-template

A much lighter than `create-react-app` (yet still powerful) starter kit for creating fully fledged React applications.

## Features

- **TypeScript** support (`typescript` package needs to be installed separately);
- Asset resolving (or transforming into Base64 URIs for files under - 4 Kb) on `import` and `require()` statements;
- Support for **Sass** pre-processor and **CSS modules**;
- **PostCSS** transformations (autoprefixing and etc.);
- _TODO:_ Class name minification for production builds (i.e. `<div class="hello-world"></div>` becomes `<div class="a_2"></div>`);
- **Batteries Not Included**: `manifest.json` and Service Workers are not generated to reduce the unneccesary bloat;
- **Fine-tuned minification rules** for production builds;
- Support for optional **pre-rendering**;
- **Stateful hot-reloading** in development mode.

## Usage

Just clone this repository and start making changes. Use `npm run start` for development purposes and `npm run build` for creating an optimized production-ready build.

**Note:** built files are meant to be served via an HTTP server. Opening `index.html` over `file://` won't work, use [http-server](https://www.npmjs.com/package/http-server) as an alternative.
