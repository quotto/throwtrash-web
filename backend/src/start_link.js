const property = require("./property");
const db = require("./dbadapter");
const error_def = require("./error_def");
const common = require("trash-common");
const logger = common.getLogger();
module.exports = async(params,session,stage) => {
    if (params.id) {
        // sessionにid（access_token相当）とstateを設定して保存
        session.user_id = params.id;
        session.state = common.generateRandomCode(20);
        try {
            await db.saveSession(session);

            // platformに応じてAlexaログインURLを返す
            let loginUrl = "";
            if (params.platform === "android") {
                loginUrl = `https://alexa.amazon.com/spa/skill-account-linking-consent?fragment=skill-account-linking-consent&client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&skill_stage=${stage}&response_type=code&redirect_uri=https://mobileapp.mythrowaway.net/accountlink&state=${session.state}`
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