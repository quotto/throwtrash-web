const db = require("./dbadapter");
const rp = require("request-promise");
module.exports = async(params,session) => {
    console.debug(JSON.stringify(session));
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
            redirect_uri: `https://backend.mythrowaway.net/${process.env.STAGE}/exchange_amazon_code`
        },
        method: "POST",
        json: true
    }

    try {
        const amazonAccessToken = await rp(options);
        console.debug(amazonAccessToken);

        const alexaEndpoint = await rp({
            uri: "https://api.amazonalexa.com/v1/alexaApiEndpoint",
            headers: {
                Authorization: `Bearer ${amazonAccessToken.access_token}`
            },
            json: true
        });

        // authorization codeを発行する
        const accessTokenRedirectUri = `https://backend.mythrowaway.net/${process.env.STAGE}/exchange_amazon_code`;
        const authorizationCode = await db.putAuthorizationCode(session.user_id, process.env.ALEXA_USER_CLIENT_ID,accessTokenRedirectUri);

        const skillStage = process.env.STAGE === "dev" ? "development" : "live";
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
        console.debug(skillResponse);

        await db.deleteSession(session.id);
        return {
            statusCode: 200
        }
    } catch(err) {
        console.error(err);
        return {
            statusCode: 500
        }
    }
}