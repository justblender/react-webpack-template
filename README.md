# react-webpack-template

A much lighter than `create-react-app` (yet still powerful) starter kit for creating fully fledged React applications.

## Features

### Code

- Babel uses `preset-env` to allow the use of the latest JavaScript features;
- Asset resolving (or transforming into Base64 URIs for files under 4 Kb) on `import` and `require()` statements;
- Support for code splitting (aka "lazy loading");
- Fine-tuned minification rules.

### Style

- Support for Sass (SCSS syntax only, let's keep old Sass syntax out of this world);
- Automatic CSS extraction from every chunk into a separate `.css` file;
- PostCSS transformations (autoprefixing and etc.);
- Critical CSS optimizations;
- Class name minification for production builds (i.e. `<div class="hello-world"></div>` becomes `<div class="a_2"></div>`)

### Other

- Builds are very lightweight and are not filled with unnecessary crap _(for starters)_ such as Manifests and Service Workers;
- Basic pre-rendering for production builds;
- Hot-reloading in development mode.

## Usage

Just clone this repository and start making changes. Use `npm run start` for development purposes and `npm run build` for creating an optimized production-ready build.

**Note:** built files are meant to be served via an HTTP server. Opening `index.html` over `file://` won't work, use [http-server](https://www.npmjs.com/package/http-server) as an alternative.
