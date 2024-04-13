/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check

import url from 'url'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ReactRefreshTypeScript from 'react-refresh-typescript'

/**
 * @type {(env: any, argv: any) => import('webpack').Configuration}
 */
export default (env, argv) => {
  const isProd = argv.mode === 'production'
  const isServer = env.app_mode === 'server'
  return {
    mode: isProd ? 'production' : 'development',
    entry: {
      index: './src/web/index',
    },
    output: {
      path: url.fileURLToPath(
        new URL(isServer ? 'server-public' : 'sw-public', import.meta.url),
      ),
      assetModuleFilename: '[name].[contenthash][ext]',
      filename: '[name].[contenthash].js',
      clean: true,
    },
    // @ts-ignore
    devServer: {
      hot: true,
      allowedHosts: 'all',
      proxy: isServer
        ? [
            {
              context: ['/api'],
              target: 'http://localhost:4001',
            },
          ]
        : [],
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|mp3)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.[jt]sx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json',
              getCustomTransformers: () => ({
                before: isProd ? [] : [ReactRefreshTypeScript()],
              }),
              transpileOnly: !isProd,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: 10,
            chunks: 'async',
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            priority: 1,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    devtool: isProd ? undefined : 'eval-cheap-source-map',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      extensionAlias: { '.js': ['.js', '.ts', '.tsx'] },
      fallback: {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Auditory Reader',
        template: './src/web/index.html',
      }),
      new NodePolyfillPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
      new webpack.DefinePlugin({
        'process.env.APP_MODE': JSON.stringify(env.app_mode),
        'process.env.APP_PUBLIC_PATH': JSON.stringify(env.app_public_path),
      }),
      ...(isProd ? [] : [new ReactRefreshWebpackPlugin()]),
    ],
  }
}
