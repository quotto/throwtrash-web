const webpack = require('webpack');
const app_root = require('app-root-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
 

module.exports = (env)=>{
    const filename = 'bundle.js';
    const path = `${app_root.path}/dist/${env.stage}`;
    const api_host = 'backend.mythrowaway.net';
    return {
        entry: './react/index.js',
        output: {
            path: path,
            filename: `js/${filename}`
        },
        module: {
            rules: [
                {
                    test: /\.js$/, //ローダーの処理対象ファイル
                    exclude: /node_modules/, //ローダーの処理対象外ファイル(ディレクトリ)
                    use: [ //利用するローダー
                        {
                            loader: 'babel-loader'
                        }
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
            new CopyPlugin([
                // {from: 'react/index.html', to: path},
                {from: 'static', to: path}
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
        }
    };
};