const app_root = require('app-root-path');

module.exports = (env)=>{
    const filename = env.version ? `v${env.version}.js` : 'bundle.js';
    const path = this.mode ==='production' ? `${app_root.path}/resource/bundle` : `${app_root.path}/backend/public`;
    return {
        entry: './frontend/index.js',
        output: {
            path: path,
            filename: filename
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
                }
            ]
        }
    };
};
