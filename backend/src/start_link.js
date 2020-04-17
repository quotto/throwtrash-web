const property = require("./property");
const db = require("./dbadapter");
const common = require("trash-common");
module.exports = async(params,session) => {
    if (params.id) {
        // sessionにid（access_token相当）とstateを設定して保存
        session.user_id = params.id;
        session.state = common.generateRandomCode(20);
        db.saveSession(session);

        // platformに応じてAlexaログインURLを返す
        let loginUrl = "";
        if (params.platform === "android") {
            loginUrl = `https://www.amazon.com/ap/oa?client_id=${process.env.ALEXA_CLIENT_ID}&scope=alexa::skills:account_linking&response_type=code&redirect_uri=https://backend.mythrowaway.net/${process.env.STAGE}/&state=${session.state}`
        }
        return {
            statusCode: 200,
            body: loginUrl,
            headers: {
                "Set-Cookie": `${property.SESSIONID_NAME}=${session.id};max-age=${property.SESSION_MAX_AGE};`
            }
        }
    }
    return {
        statusCode: 500
    }
}