const webpack = require('webpack');
const app_root = require('app-root-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
 

module.exports = (env)=>{
    const filename = 'bundle.js';
    const frontend_version = (env && env.version) || '0';
    const path = `${app_root.path}/dist/v${frontend_version}`;
    const api_host = (env && env.apihost) || 'test-backend.mythrowaway.net';
    const api_stage =  (env && env.apistage) || 'test';
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
                API_STAGE: JSON.stringify(api_stage),
                API_HOST: JSON.stringify(api_host)
            }),
            new CopyPlugin([
                {from: 'react/index.html', to: path}
            ]),
        ],
        optimization: {
            minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})]
        }
    };
};