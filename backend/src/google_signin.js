const common = require("trash-common");
const db  = require("./dbadapter");
module.exports = async(session,domain,stage)=>{
    const endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const google_state = common.generateRandomCode(20);
    const option = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        response_type:"code",
        scope:"openid profile",
        redirect_uri:`https://${domain}/${stage}/signin?service=google`,
        state: google_state,
        login_hint: "mythrowaway.net@gmail.com",
        nonce: common.generateRandomCode(16)
    };
    const params_array = [];
    for(let [key, value] of Object.entries(option)) {
        params_array.push(`${key}=${value}`);
    }
    session.googleState = google_state;
    await db.saveSession(session);
    return {
        statusCode: 301,
        headers: {
            "Cache-Control": "no-store",
            Location: endpoint + "?" + params_array.join("&")
        }
    }
};
