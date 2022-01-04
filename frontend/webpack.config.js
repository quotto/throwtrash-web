const webpack = require('webpack');
const app_root = require('app-root-path');
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');


module.exports = (env)=>{
    const filename = 'bundle.js';
    const build_path = `${app_root.path}/dist/${env.stage}`;
    console.log(build_path);
    const api_host = 'backend.mythrowaway.net';
    return {
        entry: './react/index.tsx',
        resolve: {
            extensions: ['.ts','.tsx','.js','.json','.css','...']
        },
        // target: 'node',
        output: {
            path: build_path,
            filename: `js/${filename}`
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    exclude: /node_modules/, //ローダーの処理対象外ファイル(ディレクトリ)
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                                // Reactモジュールでasync/awaitを使うために必要
                                plugins: ['@babel/plugin-transform-runtime']
                            }
                        },
                        'ts-loader'
                    ]
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
            new CopyPlugin({
                patterns: [
                    {from: 'static/', to: './'}
                ]
            }),
        ],
        optimization: {
            minimize: env.stage != 'development',
            minimizer: [
                new TerserPlugin(),
                new CssMinimizerPlugin()
            ]
        },
        // Dockerコンテナ内でwatchするための設定
        watchOptions: {
            ignored: '**/node_modules',
            poll: 1000
        }
    };
};