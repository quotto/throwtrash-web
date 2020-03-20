const sync = require("./sync");
const update = require("./update");
const register = require("./register");
const publish_activation_code = require("./publish_activation_code");
const activate = require("./activate");
exports.handler = async function(event,context) {
    if(event.resource === '/register') {
        // 新規登録処理
        return await register(JSON.parse(event.body))
    } else if(event.resource === '/update') {
        // 更新処理
        return await update(JSON.parse(event.body));
    } else if(event.resource === '/sync') {
        // データ同期処理
        return await sync(event.queryStringParameters)
    } else if(event.resource === '/publish_activation_code') {
        // データ共有のための認証コード発行
        return await publish_activation_code(event.queryStringParameters);
    } else if(event.resource === '/activate') {
        // 認証コードによる認証とデータ取得
        return await activate(event.queryStringParameters);
    }
}