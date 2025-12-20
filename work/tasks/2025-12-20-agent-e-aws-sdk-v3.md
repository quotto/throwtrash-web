# タスク一覧: api AWS SDK v3 リファクタ (2025-12-20)

- 🟩 依存関係をAWS SDK v3へ更新（@aws-sdk/*）
- 🟩 dbadapterのDynamoDBクライアントをv3へ移行し、外部注入可能にする
- 🟩 テストでの認証方式（AWS_PROFILE -> fromSSO / AWS_ACCESS_KEY_ID -> fromEnv）を反映
- 🟩 単体テストを追加/更新
- 🟩 ESLint / テスト / ビルド実行
- 🟩 レポート作成
