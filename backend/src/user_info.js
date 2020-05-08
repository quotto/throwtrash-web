const property = require("./property");
module.exports = (session)=>{
    let body = {
        name: null,
        preset: null
    };
    if(session && session.userInfo) {
        body.name = session.userInfo.name;
        body.preset = session.userInfo.preset;
    }
    return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
            "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
            "Access-Control-Allow-Credentials": true
        }
    }
}