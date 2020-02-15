const path = require("path");
const merge = require("webpack-merge");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSpaPlugin = require("prerender-spa-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");

const APP_DIR = path.resolve(__dirname, "./src/");
const BUILD_DIR = path.resolve(__dirname, "./build/");

const DEFAULT_ENV = {
  host: "localhost",
  port: 3000
};

module.exports = function(env = DEFAULT_ENV) {
  const isDevServer = process.argv.find(argv =>
    argv.includes("webpack-dev-server")
  );

  const commonConfig = {
    entry: path.resolve(APP_DIR, "index.js"),

    output: {
      path: BUILD_DIR,
      filename: "bundle.js",
      publicPath: "/"
    },

    stats: {
      entrypoints: false,
      children: false
    },

    resolve: {
      extensions: [".js", ".jsx", ".mjs", ".json"]
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          exclude: /node_modules/,

          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: isDevServer ? [] : ["transform-react-remove-prop-types"],
            cacheDirectory: true
          }
        },

        {
          test: /\.(s*)css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDevServer
              }
            },

            {
              loader: "css-loader",
              options: {
                sourceMap: isDevServer,
                modules: true
              }
            },

            {
              loader: "postcss-loader",
              options: {
                sourceMap: isDevServer,
                plugins: () => [
                  require("postcss-import")(),
                  require("postcss-url")(),
                  require("autoprefixer")()
                ]
              }
            },

            {
              loader: "sass-loader",
              options: {
                sourceMap: isDevServer
              }
            }
          ]
        },

        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: "url-loader",
          options: {
            name: "images/[name].[hash:8].[ext]",
            limit: 4096
          }
        },

        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: "url-loader",
          options: {
            name: "media/[name].[hash:8].[ext]",
            limit: 4096
          }
        },

        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: "url-loader",
          options: {
            name: "fonts/[name].[hash:8].[ext]",
            limit: 4096
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(APP_DIR, "index.html")
      })
    ]
  };

  if (!isDevServer) {
    return merge(commonConfig, {
      mode: "production",

      output: {
        filename: "scripts/[name].[contenthash:8].js",
        chunkFilename: "scripts/[name].[contenthash:8].js"
      },

      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /node_modules/,
              name: "runtime",
              chunks: "all"
            }
          }
        },

        minimizer: [
          new TerserWebpackPlugin({
            parallel: true,
            cache: true,

            terserOptions: {
              output: {
                comments: false
              },

              compress: {
                reduce_funcs: false,
                typeofs: false
              }
            }
          }),

          new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
              safe: true,

              autoprefixer: {
                disable: true
              },

              discardComments: {
                removeAll: true
              }
            }
          })
        ]
      },

      plugins: [
        new MiniCssExtractPlugin({
          filename: "styles/[name].[contenthash:8].css",
          chunkFilename: "styles/[name].[contenthash:8].css"
        }),

        new PrerenderSpaPlugin({
          routes: ["/"],
          staticDir: BUILD_DIR,

          minify: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            decodeEntities: true,
            keepClosingSlash: true,
            sortAttributes: true
          }
        })
      ]
    });
  }

  return merge(commonConfig, {
    mode: "development",

    devServer: {
      contentBase: BUILD_DIR,

      host: env.host,
      port: env.port,

      hot: true,
      open: true,
      quiet: true,

      overlay: {
        warnings: false,
        errors: true
      }
    },

    plugins: [
      new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [
            `Your application is running here: http://${env.host}:${env.port}`
          ]
        }
      })
    ]
  });
};
