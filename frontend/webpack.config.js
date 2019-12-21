const webpack = require('webpack');
const app_root = require('app-root-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
 

module.exports = (env)=>{
    const filename = 'bundle.js';
    const path = `${app_root.path}/deploy/v${env.version}`;
    const api_stage = process.env.NODE_ENV === 'production' ? env.apiversion : 'test';
    return {
        entry: './react/index.js',
        // target: 'node',
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
                API_STAGE: JSON.stringify(api_stage)
            }),
            new CopyPlugin([
                {from: 'html/index.html', to: path}
            ]),
        ],
        optimization: {
            minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})]
        }
    };
};