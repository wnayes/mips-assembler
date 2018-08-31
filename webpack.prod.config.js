const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".js" ]
  },
  output: {
    libraryTarget: "umd",
    library: "MIPSAssem",
    filename: "mipsassem.min.js",
    path: path.resolve(__dirname, "dist")
  }
};
