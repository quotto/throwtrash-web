const args = require('args');
const app_root = require('app-root-path');

args.option('p')
    .option('d')
    .option('output-path','','dist');
const arg_option = args.parse(process.argv);

module.exports = {
    entry: './frontend/index.js',
    output: {
        path: `${app_root.path}/${arg_option.outputPath}`,
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
                            presets: ['@babel/preset-env','@babel/preset-react']
                        }
                    }
                ]
            }
        ]
    }
};
