import db from "./dbadapter";
import {AccountLinkItem, SKILL_STAGE} from "./interface";
import * as common from "trash-common";
import property from "./property";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
const logger = common.getLogger();

export default async(params: APIGatewayProxyEventQueryStringParameters ,stage: string): Promise<APIGatewayProxyResultV2> => {
    if (params.user_id && params.platform) {
        const token = common.generateUUID();
        const state = common.generateRandomCode(20);
        const redirect_uri = "https://mobile.mythrowaway.net/accountlink";
        try {
            if(typeof process.env.ALEXA_CLIENT_ID === "undefined") {
                throw Error("ALEXA_CLIENT_ID is undfined");
            }
            const skill_stage = process.env.SKILL_STAGE as SKILL_STAGE;
            if (skill_stage != "development" && skill_stage != "live") {
                throw Error("SKILL_STAGE is invalid");
            }
            // デフォルトでLoginWithAmazonの認可エンドポイントを返す
            let loginUrl = `https://www.amazon.com/ap/oa?client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&skill_stage=${skill_stage.toString()}&response_type=code&state=${state}`;
            if (params.platform === "android" || params.platform === "ios") {
                // AndroidまたはiOSからアカウントリンクする場合はアレクサアプリのアプリリンクを返す
                loginUrl = `https://alexa.amazon.com/spa/skill-account-linking-consent?fragment=skill-account-linking-consent&client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&skill_stage=${skill_stage.toString()}&response_type=code&state=${state}`
            }
            loginUrl += `&redirect_uri=${redirect_uri}`;

            // redirect_uriはAmazonのアクセストークン取得要求に必要なのでセッションに保存しておく
            const accountLinkItem : AccountLinkItem = {
                token: token,
                user_id: params.user_id,
                state: state,
                redirect_url: redirect_uri,
                TTL: Math.ceil(Date.now()/1000) + property.ACCOUNT_LINK_EXPIRE_SECONDS
            };
            logger.debug("put account link info \n"+JSON.stringify(accountLinkItem));
            if(await db.putAccountLinkItem(accountLinkItem)) {
                logger.debug(`resonse accountlink url: ${loginUrl}`);
                return {
                    statusCode: 200,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                    body: JSON.stringify({
                        token: accountLinkItem.token,
                        url: loginUrl,
                    })
                }
            } else {
                return {statusCode: 500};
            }
        } catch(err: any) {
            logger.error(err);
            return {statusCode: 500}
        }
    }
    return {
        statusCode: 400
    };
}