const app_root = require('app-root-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
 

module.exports = (env)=>{
    const filename = env.version ? `v${env.version}.js` : 'bundle.js';
    const path = `${app_root.path}/backend/public/resource`;
    return {
        entry: './frontend/index.js',
        output: {
            path: path,
            filename: `bundle/${filename}`
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
        ],
        optimization: {
            minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})]
        }
    };
};
