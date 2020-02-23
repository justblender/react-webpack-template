const fs = require("fs");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const devServerEnabled = Boolean(
  process.argv.find(function(argv) {
    return argv.includes("webpack-dev-server");
  })
);

module.exports = function(webpackEnv = {}, webpackArgs = {}) {
  const createSourceMaps = Boolean(webpackEnv.sourceMaps) || devServerEnabled;
  const createProductionBundle = Boolean(webpackEnv.production);

  function resolveFilename(filename, hashType) {
    return createProductionBundle
      ? filename.replace("[name]", `$&.[${hashType}]`)
      : filename;
  }

  function getTranspilingLoaders(additionalLoaders = []) {
    const babelPlugins = [
      "@babel/plugin-transform-runtime",
      "react-hot-loader/babel"
    ];

    if (createProductionBundle) {
      babelPlugins.push("transform-react-remove-prop-types");
    }

    return [
      {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: babelPlugins,
          cacheDirectory: true,
          cacheCompression: false
        }
      },

      ...additionalLoaders
    ];
  }

  function getStylingLoaders(additionalLoaders = []) {
    return [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: createProductionBundle,
          hmr: devServerEnabled
        }
      },

      {
        loader: "css-loader",
        options: {
          // TODO: CSS Modules have an impact on build performance,
          // might have to enable them only for .module.css files
          modules: {
            localIdentName: createProductionBundle
              ? "[hash:base64]"
              : "[path][name]__[local]"
          },

          esModule: createProductionBundle,
          importLoaders: additionalLoaders.length + 1,
          sourceMap: createSourceMaps
        }
      },

      {
        loader: "postcss-loader",
        options: {
          sourceMap: createSourceMaps,
          plugins: [
            require("postcss-flexbugs-fixes")(),
            require("postcss-preset-env")({ stage: 3 }),
            require("postcss-normalize")()
          ]
        }
      },

      ...additionalLoaders
    ];
  }

  const config = {
    mode: createProductionBundle ? "production" : "development",
    bail: createProductionBundle,

    devtool:
      createSourceMaps &&
      (devServerEnabled ? "cheap-module-source-map" : "source-map"),

    entry: {
      index: path.resolve(__dirname, "./src/index.js")
    },

    output: {
      filename: resolveFilename("scripts/[name].js", "chunkhash:8"),
      chunkFilename: resolveFilename("scripts/[name].js", "chunkhash:8"),

      path: path.resolve(__dirname, "./build/"),
      publicPath: "/"
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        "react-dom": "@hot-loader/react-dom"
      }
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: getTranspilingLoaders()
        },

        {
          test: /\.(post)?css$/,
          use: getStylingLoaders()
        },

        {
          test: /\.s[ac]ss$/,
          use: getStylingLoaders([
            {
              loader: "resolve-url-loader",
              options: {
                sourceMap: createSourceMaps
              }
            },

            {
              loader: "sass-loader",
              options: {
                // source map needs to be always enabled in this loader since
                // resolve-url-loader relies on source map data from preceeding loaders
                sourceMap: true
              }
            }
          ])
        },

        {
          test: /\.(png|jpe?g|gif|svg)$/,
          loader: "url-loader",
          options: {
            name: resolveFilename("images/[name].[ext]", "contenthash:8"),
            limit: 4 * 1024
          }
        },

        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
          loader: "url-loader",
          options: {
            name: resolveFilename("media/[name].[ext]", "contenthash:8"),
            limit: 4 * 1024
          }
        },

        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          loader: "url-loader",
          options: {
            name: resolveFilename("fonts/[name].[ext]", "contenthash:8"),
            limit: 4 * 1024
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./src/index.html"),
        minify: createProductionBundle && {
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortAttributes: true
        }
      }),

      new MiniCssExtractPlugin({
        filename: resolveFilename("styles/[name].css", "chunkhash:8"),
        chunkFilename: resolveFilename("styles/[name].css", "chunkhash:8")
      })
    ],

    node: {
      child_process: "empty",
      dgram: "empty",
      dns: "mock",
      fs: "empty",
      http2: "empty",
      module: "empty",
      net: "empty",
      tls: "empty"
    },

    stats: {
      children: false,
      modules: false
    }
  };

  const useTypeScript = fs.existsSync(
    path.resolve(__dirname, "./tsconfig.json")
  );

  if (useTypeScript) {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: getTranspilingLoaders([
        {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        }
      ])
    });

    config.plugins.push(
      new ForkTsCheckerWebpackPlugin({
        async: devServerEnabled
      })
    );
  }

  if (createProductionBundle) {
    config.optimization = {
      moduleIds: "hashed",
      runtimeChunk: "single",

      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            name: "vendor",
            chunks: "all"
          }
        }
      },

      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          parallel: true,
          extractComments: false,

          terserOptions: {
            compress: {
              reduce_funcs: false,
              typeofs: false
            },

            mangle: {
              safari10: true
            },

            output: {
              ascii_only: true,
              comments: false
            }
          }
        }),

        new OptimizeCssAssetsWebpackPlugin({
          cssProcessorOptions: {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true
                }
              }
            ]
          }
        })
      ]
    };
  }

  if (devServerEnabled) {
    const host = webpackArgs.host || "localhost";
    const port = webpackArgs.port || 3000;

    config.devServer = {
      host: host,
      port: port,

      hot: true,
      open: true,
      quiet: true,

      overlay: {
        warnings: false,
        errors: true
      }
    };

    config.plugins.push(
      new FriendlyErrorsWebpackPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is accessible at http://${host}:${port}`]
        }
      })
    );
  }

  return config;
};
