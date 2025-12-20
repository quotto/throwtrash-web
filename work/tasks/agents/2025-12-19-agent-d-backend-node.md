# 2025-12-19 agent-d backend node

## 方針
- Lambda runtimeは nodejs22.x を採用する。

## 具体作業
1. [x] backend/cfn/func-template.yml の Runtime を nodejs22.x に変更
2. [x] backend/src/package.json の @types/node など依存を Node 22 に合わせて更新
3. [x] backend/src/package-lock.json を再生成
4. [ ] npm test / npm run build 実行（npm test 失敗、npm run build 成功）
5. [x] work/reports/YYYY-MM-DD-agent-d.md に変更内容と結果を記録

## 注意
- ロジック修正は禁止。依存・設定のみ。
