const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const cssMin = require('mini-css-extract-plugin')
const myPlugin = require('./myPlugins')
const path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    // admin: './src/admin.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test:/\.js$/,
        use:path.resolve(__dirname,'./my-loaders/shiyuan-loader.js'), // usebabel-loader config file. Note: you can use
      },
      // css文件引入
      {
        test: /\.(sa|sc|c|le)ss$/,
        use: [cssMin.loader, 'css-loader', 'postcss-loader', 'less-loader'],
      },
      // txt文件
      {
        test: /\.txt$/,
        use: 'raw-loader',
      },
      // md文件
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
          },
        ],
      },
      // 图片引入
      {
        test: /\.(jpg|.png|.jpeg)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            outputPath: './assets',
            // publicPath:"/public/assets"
          },
        },
      },
    ],
  },
  plugins: [
    new myPlugin({
      name:'shiyuan'
    }),
    new HtmlWebpackPlugin({
      filename: 'main.html',
      chunks: ['main'],
      template: path.resolve(__dirname, './public/index.html'),
    }),
    new CleanWebpackPlugin(),
    new cssMin()
    // new HtmlWebpackPlugin({
    //   filename:"admin.html",
    //   chunks:['admin']
    // })
  ],
}
