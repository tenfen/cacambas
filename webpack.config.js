const path = require("path")
const webpack = require("webpack")
const ESLintPlugin = require("eslint-webpack-plugin")

module.exports = {
  cache: true,
  watch: true,
  entry: { main: "./src/index.js" },
  resolve: {
    fallback: { path: require.resolve("path-browserify") },
    extensions: [".js", ".jsx", ".json", ".scss"],
  },
  plugins: [
    new ESLintPlugin(),
    new webpack.DefinePlugin({
      PUBLIC_URL: JSON.stringify(process.env.PUBLIC_URL),
    }),
    new webpack.IgnorePlugin(new RegExp("/(node_modules|ckeditor)/")),
  ],
}
