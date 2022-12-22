import sync from "./sync";
import update from "./update";
import register from "./register";
import publish_activation_code from "./publish_activation_code";
import activate from "./activate";

import * as common from "trash-common";
import start_link from "./start_link";
import enable_skill from "./enable_skill";
const logger = common.getLogger();
process.env.RUNLEVEL === "INFO" ? logger.setLevel_INFO() : logger.setLevel_DEBUG();

exports.handler = async function(event: AWSLambda.APIGatewayEvent,_context: AWSLambda.Context) {
    logger.debug(JSON.stringify(event));
    if(event.resource === '/register') {
        // 新規登録処理
        if(event.body === null) {
            logger.error("/register error: body is null");
            return {
                sttatusCode: 400
            };
        }
        return await register(JSON.parse(event.body))
    } else if(event.resource === '/update') {
        // 更新処理
        if(event.body === null) {
            logger.error("/update error: body is null");
            return {
                statusCode: 400
            }
        }
        return await update(JSON.parse(event.body));
    } else if(event.resource === '/start_link') {
        return await start_link(event.queryStringParameters || {}, event.requestContext.stage);
    } else if(event.resource === '/sync') {
        // データ同期処理
        return await sync(event.queryStringParameters || {});
    } else if(event.resource === '/publish_activation_code') {
        // データ共有のための認証コード発行
        return await publish_activation_code(event.queryStringParameters || {});
    } else if(event.resource === '/activate') {
        // 認証コードによる認証とデータ取得
        return await activate(event.queryStringParameters || {});
    } else if(event.resource === '/enable_skill') {
        return await enable_skill(event.queryStringParameters || {}, event.requestContext.stage);
    }
}