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
            logger.info("save session on start_link\n"+JSON.stringify(session));
            await db.saveSession(session);

            // platformに応じてAlexaログインURLを返す
            let loginUrl = "";
            if (params.platform === "android") {
                loginUrl = `https://alexa.amazon.com/spa/skill-account-linking-consent?fragment=skill-account-linking-consent&client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&skill_stage=${stage==="dev" ? "development" : "live"}&response_type=code&state=${session.state}`
            }
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
        } catch(err) {
            logger.error(err);
            return error_def.ServerError;
        }
    }
    return error_def.UserError;
}