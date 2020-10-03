const { join, resolve, relative, dirname } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { readdirSync } = require('fs');

/**
 * tailPkgs: package 目录下，所有非 '.*' 的目录名数组，仅一级目录
 * @type {string[]}
 * doc: http://nodejs.cn/api/fs.html#fs_fs_readdirsync_path_options
 */
// fs.readdirSync(path, options?): string[filename]
const tailPkgs = readdirSync(join(__dirname, 'packages')).filter((pkg) => pkg.charAt(0) !== '.');

const webpackConfigList = [];

tailPkgs.forEach((pkg) => {
  const entry = {};
  entry[`${pkg}`] = `./packages/${pkg}/src/index.tsx`;
  entry[`${pkg}.min`] = `./packages/${pkg}/src/index.tsx`;

  // https://www.webpackjs.com/configuration/
  const config = {
    // 入口文件
    entry,
    output: {
      filename: '[name].js',
      library: `Pro${pkg.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`,
      libraryExport: 'default',
      // output 目录对应一个绝对路径。
      path: resolve(__dirname, 'packages', pkg, 'dist'),
      globalObject: 'this',
    },
    // 如果没有设置，webpack 会给 mode 的默认值设置为 production。
    // https://webpack.docschina.org/configuration/mode/
    mode: 'production',
    // 自动解析确定的扩展
    resolve: {
      extensions: ['.ts', '.tsx', '.json', '.css', '.js', '.less'],
    },
    // 优化，配合 config.mode
    optimization: {
      // optimization.minimize: 告知 webpack 使用 TerserPlugin 或其它在 optimization.minimizer 定义的插件压缩 bundle。
      // https://webpack.docschina.org/configuration/optimization/#optimizationminimize
      minimizer: [
        new TerserPlugin({
          include: /\.min\.js$/,
        }),
        new OptimizeCSSAssetsPlugin({
          include: /\.min\.js$/,
        }),
      ],
    },
    module: {
      // 创建模块时，匹配请求的规则数组。这些规则能够修改模块的创建方式。 这些规则能够对模块(module)应用 loader，或者修改解析器(parser)。
      rules: [
        {
          test: /\.jsx?$/,
          // https://webpack.docschina.org/configuration/module/#ruleuse
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/typescript', '@babel/preset-env'],
              plugins: ['@vue/babel-plugin-jsx'],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/typescript',
                [
                  '@babel/env',
                  {
                    loose: true,
                    modules: false,
                  },
                ],
                '@babel/react',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                '@babel/proposal-object-rest-spread',
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader', // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: (resourcePath, context) =>
                  `${relative(dirname(resourcePath), context)}/`,
              },
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      // 进度条
      new ProgressBarPlugin(),
      // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
    ],
  };
  webpackConfigList.push(config);
});

module.exports = webpackConfigList;
