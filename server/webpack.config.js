module.exports = {
    mode: 'development',
    entry: './frontend/index.js',
    output: {
        filename: 'pack.js'
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
                            presets: ['@babel/preset-env','@babel/preset-react']
                        }
                    }
                ]
            }
        ]
    }
};
