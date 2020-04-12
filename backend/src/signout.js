const property = require("./property");
const db = require("./dbadapter");
module.exports = async(session)=>{
    if(session.userInfo) {
        console.info("signout:"+session.userInfo.signinId);
        session.userInfo = undefined;
        await db.saveSession(session);
        return {
            statusCode: 200,
            body: "signout",
            headers: {
                "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
                "Access-Control-Allow-Credentials": true
            }
        }
    }
    console.warn("not signed in user");
    return {
        statusCode: 200,
        body: "",
        headers: {
            "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
            "Access-Control-Allow-Credentials": true
        }
    }
}