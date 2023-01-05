/* eslint-disable @typescript-eslint/no-var-requires */

import url from 'url'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const sassRule = (cssmodule) => {
  const moduleTest = /\.module\.s[ac]ss$/i
  return {
    test: cssmodule ? moduleTest : /\.s[ac]ss$/i,
    exclude: cssmodule ? undefined : moduleTest,
    use: [
      MiniCssExtractPlugin.loader,
      // Translates CSS into CommonJS
      {
        loader: 'css-loader',
        options: {
          modules: cssmodule,
        },
      },
      // Compiles Sass to CSS
      'sass-loader',
    ],
  }
}

/**
 * @type {() => import('webpack').Configuration}
 */
export default (env, argv) => {
  const isProd = argv.mode === 'production'
  const isServer = env.app_mode === 'server'
  return {
    entry: {
      index: './src/web/index',
    },
    output: {
      path: url.fileURLToPath(
        new URL(isServer ? 'server-public' : 'sw-public', import.meta.url)
      ),
      assetModuleFilename: '[name].[contenthash][ext]',
      filename: '[name].[contenthash].js',
      clean: true,
    },
    devServer: {
      allowedHosts: 'all',
      ...(isServer
        ? {
            proxy: {
              '/api': 'http://localhost:4001',
            },
          }
        : {}),
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|mp3)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json',
            },
          },
          exclude: /node_modules/,
        },
        sassRule(false),
        sassRule(true),
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
    devtool: isProd ? undefined : 'eval-source-map',
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
      new NodePolyfillPlugin({
        includes: ['path'],
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
      new webpack.DefinePlugin({
        'process.env.APP_MODE': JSON.stringify(env.app_mode),
        'process.env.APP_PUBLIC_PATH': JSON.stringify(env.app_public_path),
      }),
    ],
  }
}
