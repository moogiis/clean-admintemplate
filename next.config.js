const withPlugins = require("next-compose-plugins");
const withCSS = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const withLess = require("@zeit/next-less");

if (typeof require !== "undefined") {
  require.extensions[".less"] = file => {};
}

module.exports = withCSS(
  withLess(
    withSass({
      lessLoaderOptions: { javascriptEnabled: true },
      webpack: (config, { isServer }) => {
        if (isServer) {
          const antStyles = /antd\/.*?\/style.*?/;
          const origExternals = [...config.externals];
          config.externals = [
            (context, request, callback) => {
              if (request.match(antStyles)) return callback();
              if (typeof origExternals[0] === "function") {
                origExternals[0](context, request, callback);
              } else {
                callback();
              }
            },
            ...(typeof origExternals[0] === "function" ? [] : origExternals)
          ];
          config.module.rules.unshift({
            test: antStyles,
            use: "null-loader"
          });
        }
        config.module.rules.push({
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 100000
            }
          }
        });
        return config;
      }
    })
  )
);
