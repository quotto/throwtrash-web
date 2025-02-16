import sync from "./sync";
import update from "./update";
import register from "./register";
import publish_activation_code from "./publish_activation_code";
import activate from "./activate";
import migrationSignup from './migration/signup';
import * as admin from 'firebase-admin';

import start_link from "./start_link";
import enable_skill from "./enable_skill";
import migrationV2 from "./migration/v2";
import signin from "./signin";

import Logger from './logger';
const logger = new Logger('index');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

exports.handler = async function(event: AWSLambda.APIGatewayEvent,_context: AWSLambda.Context) {
    logger.debug({message: 'handler', data: event});

    // Extract the ID token from the request headers
    const token = event.headers.Authorization || event.headers.authorization;

    if (!token) {
        return {
            statusCode: 401,
            body: 'Unauthorized',
        };
    }

    // Verify the ID token using Firebase Admin SDK
    let firebaseAccountId;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        firebaseAccountId = decodedToken.uid;
    } catch (error) {
        logger.error({message: 'Error verifying ID token', data: error});
        return {
            statusCode: 403,
            body: 'Forbidden',
        };
    }

    if (event.resource === '/migration/signup') {
        return await migrationSignup(event.body || '', firebaseAccountId);
    } else if(event.resource === '/register') {
        // 新規登録処理
        return await register(event.body || "", firebaseAccountId);
    } else if(event.resource === '/update') {
        // 更新処理
        if(event.body === null) {
            logger.error({message: "/update error: body is null"});
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
    } else if(event.resource === '/migration/v2') {
        return await migrationV2(event.queryStringParameters || {});
    } else if(event.resource === '/signin') {
        return await signin(event);
    }
}