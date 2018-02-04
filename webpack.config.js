var path = require("path");

module.exports = {
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
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  output: {
    libraryTarget: "umd",
    library: "MIPSAssem",
    filename: "mipsassem.js",
    path: path.resolve(__dirname, "dist")
  }
};
