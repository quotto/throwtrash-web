const log4js = require("log4js");
const logger = log4js.getLogger();
const db = require("./dbadapter");
const rp = require("request-promise");
module.exports = async(params,session,stage) => {
    logger.debug(JSON.stringify(session));
    if(params.state != session.state) {
        return {
            statusCode: 400
        }
    }
    // amazon access tokenを取得する
    const options = {
        uri: "https://api.amazon.com/auth/o2/token",
        form: {
            grant_type: "authorization_code",
            code: params.code,
            client_id: process.env.ALEXA_CLIENT_ID,
            client_secret: process.env.ALEXA_CLIENT_SECRET,
            redirect_uri: `https://backend.mythrowaway.net/${stage}/enable_skill`
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

        // authorization codeを発行する
        const accessTokenRedirectUri = `https://backend.mythrowaway.net/${stage}/enable_skill`;
        const authorizationCode = await db.putAuthorizationCode(session.user_id, process.env.ALEXA_USER_CLIENT_ID,accessTokenRedirectUri,300);

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
                    redirectUri: accessTokenRedirectUri,
                    authCode: authorizationCode.code,
                    type: "AUTH_CODE"
                }
            }
        }
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
        logger.error(err);
        return {
            statusCode: 500
        }
    }
}