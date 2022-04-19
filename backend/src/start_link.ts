import property from "./property";
import db from "./dbadapter";
import error_def from "./error_def";
import {BackendResponse} from "./interface";
import * as common from "trash-common";
const logger = common.getLogger();
export default async(params: any,session: any,stage: string): Promise<BackendResponse> => {
    if (params.id) {
        // sessionにid（access_token相当）とstateを設定して保存
        session.user_id = params.id;
        session.state = common.generateRandomCode(20);
        try {

            // デフォルトでLoginWithAmazonの認可エンドポイントを返す
            let loginUrl = `https://www.amazon.com/ap/oa?client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&response_type=code&state=${session.state}`;
            let redirect_uri = `https://backend.mythrowaway.net/${stage}/enable_skill`;

            if (params.platform === "android") {
                // Androidでアレクサアプリを使う場合はアレクサアプリのアプリリンクを返す
                redirect_uri = "https://mobileapp.mythrowaway.net/accountlink";
                loginUrl = `https://alexa.amazon.com/spa/skill-account-linking-consent?fragment=skill-account-linking-consent&client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&skill_stage=${stage==="dev" ? "development" : "live"}&response_type=code&state=${session.state}`
            }
            loginUrl+=`&redirect_uri=${redirect_uri}`;

            // redirect_uriはAmazonのアクセストークン取得要求に必要なのでセッションに保存しておく
            session.redirect_uri = redirect_uri
            logger.info("save session on start_link\n"+JSON.stringify(session));
            await db.saveSession(session);

            return {
                // statusCode: 301,
                statusCode: 200,
                headers: {
                    // Location: loginUrl,
                    "Set-Cookie": `${property.SESSIONID_NAME}=${session.id};max-age=${property.SESSION_MAX_AGE};`,
                    "Cache-Control": "no-store",
                },
                body: JSON.stringify({url: loginUrl})
            }
        } catch(err: any) {
            logger.error(err);
            return error_def.ServerError;
        }
    }
    return error_def.UserError;
}