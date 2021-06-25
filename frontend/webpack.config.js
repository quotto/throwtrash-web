const webpack = require('webpack');
const app_root = require('app-root-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
 

module.exports = (env)=>{
    const filename = 'bundle.js';
    const build_path = `${app_root.path}/dist/${env.stage}`;
    const api_host = 'backend.mythrowaway.net';
    return {
        entry: './react/index.js',
        target: 'node',
        output: {
            path: build_path,
            filename: `js/${filename}`
        },
        module: {
            rules: [
                {
                    test: /\.js$/, //ローダーの処理対象ファイル
                    exclude: /node_modules/, //ローダーの処理対象外ファイル(ディレクトリ)
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        // Reactモジュールでasync/awaitを使うために必要
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                },
                {
                    test: /\.css$/, //ローダーの処理対象ファイル
                    exclude: /node_modules/, //ローダーの処理対象外ファイル(ディレクトリ)
                    use: [ //利用するローダー
                        MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/index.css'
            }),
            new webpack.DefinePlugin({
                API_STAGE: JSON.stringify(env.stage),
                API_HOST: JSON.stringify(api_host)
            }),
            new CopyPlugin([
                {from: 'static', to: build_path}
            ]),
        ],
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions:{
                        compress: {
                            drop_console: env.stage != 'dev'
                        }
                    }
                }), 
                new OptimizeCSSAssetsPlugin({})]
        },
        // Dockerコンテナ内でwatchするための設定
        watchOptions: {
            ignored: '**/node_modules',
            poll: 1000
        }
    };
};