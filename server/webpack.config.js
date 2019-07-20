const app_root = require('app-root-path');


module.exports = (env)=>{
    return {
        entry: './frontend/index.js',
        output: {
            path: `${app_root.path}/backend/public`,
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/, //ローダーの処理対象ファイル
                    exclude: /node_modules/, //ローダーの処理対象外ファイル(ディレクトリ)
                    use: [ //利用するローダー
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env', '@babel/preset-react']
                            }
                        }
                    ]
                }
            ]
        }
    }
};
