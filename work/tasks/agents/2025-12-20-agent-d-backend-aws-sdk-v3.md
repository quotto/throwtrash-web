# 2025-12-20 agent-d backend aws-sdk v3

## 目的
- aws-sdk v3 へ移行し、SSO プロファイルを SDK から参照可能にする。

## タスク
- [x] backend/src/package.json の aws-sdk v2 を v3 パッケージへ置換
- [x] backend/src/dbadapter.ts を v3 の DynamoDBDocumentClient へ移行
- [x] backend/src/__tests__/dbadapter.test.ts の DynamoDB 操作を v3 に合わせて修正
- [x] npm install で package-lock.json を更新
- [x] npm test / npm run build を実行（npm test 失敗）
- [x] npx eslint . を実行
- [x] work/reports/2025-12-20-agent-d.md を更新

## 実行コマンド
- AWS_REGION=ap-northeast-1 AWS_PROFILE=dev-admin AWS_SDK_LOAD_CONFIG=1 GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npm test
- npm run build
- npx eslint .
