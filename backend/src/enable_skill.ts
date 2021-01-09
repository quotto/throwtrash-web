import { SessionItem } from "./interface";

import * as common from "trash-common";
const logger = common.getLogger();
import db from "./dbadapter";
import error_def from "./error_def";
import rp from "request-promise";

export default async(params: any,session: SessionItem,stage: string) => {
    logger.debug(JSON.stringify(session));
    if(params.state != session.state) {
        logger.error(`Invalid State -> params=${params.state}, session=${session.state}`);
        return error_def.UserError;
    }
    // amazon access tokenを取得する
    const options = {
        uri: "https://api.amazon.com/auth/o2/token",
        form: {
            grant_type: "authorization_code",
            code: params.code,
            client_id: process.env.ALEXA_CLIENT_ID,
            client_secret: process.env.ALEXA_CLIENT_SECRET,
            redirect_uri: params.redirect_uri
        },
        method: "POST",
        json: true
    }

    try {
        const amazonAccessToken = await rp(options);
        logger.debug(amazonAccessToken);

        const alexaEndpoint = await rp({
            uri: "https://api.amazonalexa.com/v1/alexaApiEndpoint",
            headers: {
                Authorization: `Bearer ${amazonAccessToken.access_token}`
            },
            json: true
        });

        // サービス側(今日のゴミ出し)のアクセストークン取得のためのauthorization codeを発行しておく
        // 認可サーバとサービスのバックエンドサーバ分離している場合にはここでもリクエスト送受信が発生する
        const authorizationCode = await db.putAuthorizationCode(session.user_id, process.env.ALEXA_USER_CLIENT_ID!,params.redirect_uri,300);

        const skillStage = stage === "dev" ? "development" : "live";
        const enableSkillOptions = {
            uri: `https://${alexaEndpoint.endpoints[0]}/v1/users/~current/skills/${process.env.ALEXA_SKILL_ID}/enablement`,
            headers: {
                Authorization: `Bearer ${amazonAccessToken.access_token}`
            },
            json: true,
            method: "POST",
            body: {
                stage: skillStage,
                accountLinkRequest: {
                    redirectUri: params.redirect_uri,
                    authCode: authorizationCode.code,
                    type: "AUTH_CODE"
                }
            }
        }
        
        // Alexa APIエンドポイントにスキル有効化のリクエストを送信する
        // Alexa APIではサービス（今日のゴミ出し）にauthorization codeをつけてアクセストークンをリクエストする
        // 正常にアクセストークンが取得できれば200が戻る
        const skillResponse = await rp(enableSkillOptions);
        logger.debug(skillResponse);

        await db.deleteSession(session.id);
        return {
            statusCode: 301,
            headers: {
                Location: `https://accountlink.mythrowaway.net/${stage}/accountlink-complete.html`
            }
        }
    } catch(err) {
        logger.error(err.stack || err);
        return error_def.ServerError;
    }
}