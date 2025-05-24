
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rspack } from "@rspack/core";
import RefreshPlugin from "@rspack/plugin-react-refresh";
import { withZephyr } from "zephyr-rspack-plugin";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";

export default withZephyr()({
  context: __dirname,
  entry: {
    main: "./src/main.jsx"
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset"
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev
                  }
                }
              },
              env: {
                targets: [
                  "chrome >= 87",
                  "edge >= 88",
                  "firefox >= 78",
                  "safari >= 14"
                ]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new rspack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    new rspack.ProgressPlugin({}),
    new rspack.HtmlRspackPlugin({
      template: "./index.html"
    }),
    new ModuleFederationPlugin({
      name: "react_remote",
      filename: 'remoteEntry.js',
      exposes: {
        './Counter': "./src/Counter"
      },
      shared: {
        react: { eager: true },
        'react-dom': { eager: true },
        'react-router-dom': { eager: true },
      },
    }),
    isDev ? new RefreshPlugin() : null
  ].filter(Boolean),
  experiments: {
    css: true
  }
});

