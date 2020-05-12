const common = require("trash-common");
const logger = common.getLogger();
const db = require("./dbadapter");
const rp = require("request-promise");
const jwt = require("jsonwebtoken");
const error_def = require("./error_def");

const requestAmazonProfile = (access_token)=>{
    return rp({
        uri: "https://api.amazon.com/user/profile",
        qs: {
            access_token: access_token
        },
        resolveWithFullResponse: true,
        json: true
    }).then(response => {
        logger.debug("signin on amazon",JSON.stringify(response));
        if (response.statusCode === 200) {
            return {id: response.body.user_id, name: response.body.name};
        }
        logger.error(response);
        throw new Error("Signin Failed");
    }).catch(err=>{
        logger.error(err);
        throw new Error("Amazon Signin Failed");
    });
}

const requestGoogleProfile = (code,domain,stage)=>{
    const options = {
        uri: "https://oauth2.googleapis.com/token",
        method: "POST",
        body: {
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `https://${domain}/${stage}/signin?service=google`,
            grant_type: "authorization_code"
        },
        json: true
    };
    return rp(options).then(response=>{
        logger.debug("sign in on google:",response);
        if(response.id_token) {
            const decoded_token = jwt.decode(response.id_token);
            return {id: decoded_token.sub, name: decoded_token.name};
        } 
        logger.error(JSON.stringify(response));
        throw new Error("Signin Failed");
    }).catch(err=>{
        logger.error(err);
        throw new Error("Google Signin Failed");
    });
}

module.exports = async(params,session,domain,stage)=>{
    let service_request = null;
    if (params.service === "amazon" && params.access_token && session) {
        service_request = requestAmazonProfile(params.access_token);
    } else if(params.service === "google" 
                && params.code && params.state 
                && session && params.state === session.googleState) {
        service_request = requestGoogleProfile(params.code,domain,stage);
    }  else {
        logger.error("invalid parameter",params,session);
        return error_def.UserError;
    }

    try {
        const user_info = await service_request;
        const user_data = await db.getDataBySigninId(user_info.id);
        // eslint-disable-next-line require-atomic-updates
        session.userInfo = {
            signinId: user_info.id,
            name: user_info.name,
            signinService: params.service
        };
        if (user_data.id) {
            // eslint-disable-next-line require-atomic-updates
            session.userInfo.id = user_data.id;
            // eslint-disable-next-line require-atomic-updates
            session.userInfo.preset = JSON.parse(user_data.description);
        } else {
            // eslint-disable-next-line require-atomic-updates
            session.userInfo.preset = [];
        }

        if (await db.saveSession(session)) {
            return {
                statusCode: 301,
                headers: {
                    Location: `https://accountlink.mythrowaway.net/${stage}/index.html`,
                    "Cache-Control": "no-store"
                }
            }
        }
    } catch(err) {
        logger.error(err);
        return error_def.ServerError;
    }
}