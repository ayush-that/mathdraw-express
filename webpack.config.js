const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

const isEnvProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isEnvProduction ? "production" : "development",
  devtool: isEnvProduction ? "source-map" : "eval-source-map",
  entry: "./src/index.tsx",
  experiments: {
    outputModule: true,
  },
  output: {
    pathinfo: !isEnvProduction,
    path: path.resolve(__dirname, "dist"),
    module: true,
    filename: "index.js",
  },
  externalsType: "module",
  externalsPresets: { web: true },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      scriptLoading: "module",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/*.json", to: "[name][ext]" }],
    }),
    new webpack.DefinePlugin({
      "process.env.VITE_GEMINI_API_KEY": JSON.stringify(
        process.env.VITE_GEMINI_API_KEY,
      ),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /(\.css)$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"],
  },
};
