const common = require("trash-common");
const logger = common.getLogger();
logger.LEVEL = process.env.RUNLEVEL === "INFO" ? logger.INFO : logger.DEBUG;

const property = require("./property");
const error_def = require("./error_def");
const db = require("./dbadapter");
const user_info = require("./user_info");
const register = require("./register");
const request_accesstoken = require("./request_accesstoken");
const signout = require("./signout");
const signin = require("./signin");
const oauth_request = require("./oauth_request");
const google_signin = require("./google_signin");
const start_link = require("./start_link");
const enable_skill = require("./enable_skill");

const extractSessionId = (cookie)=>{
    if(cookie) {
        const c_array = cookie.split(";");
        for(let i=0; i < c_array.length; i++) {
            const element = c_array[i];
            const start = element.indexOf(`${property.SESSIONID_NAME}=`);
            if(start >= 0) {
                return element.substring(start+(`${property.SESSIONID_NAME}=`.length))
            }
        }
    }
    return null;
};

exports.handler = async function(event,context) {
    logger.debug(event);
    logger.debug(context);
    let session = null;
    let sessionId = extractSessionId(event.headers.Cookie);
    logger.debug("get sessionId in cookie:",sessionId);
    if(sessionId) {
        session = await db.getSession(sessionId);
        logger.debug("get session",session);
    }
   if(event.resource === "/oauth_request")  {
       let new_session_flg = false;
       if(!session) {
           new_session_flg = true;
           session = await db.publishSession();
       }
       return oauth_request(event.queryStringParameters, session, new_session_flg, event.requestContext.stage);
   } else if(event.resource === "/google_signin") {
       if(session) {
           return google_signin(session, event.requestContext.domainName, event.requestContext.stage);
       }
   } else if(event.resource === "/signin") {
       if(session) {
           return signin(event.queryStringParameters,session,event.requestContext.domainName,event.requestContext.stage);
       }
   } else if(event.resource === "/signout") {
       if(session) {
           return signout(session);
       }
   } else if(event.resource === "/user_info") {
       return user_info(session);
   } else if(event.resource === "/regist") {
       if(session) {
           try {
               const body = JSON.parse(event.body);
               return register(body, session);
           } catch(err){ 
               logger.error(err);
           }
       }
       // /registはフォームから非同期で呼ばれるためエラーの場合は400を返す
       return {
           statusCode: 400,
           body: "Invalid Session"
       };
   } else if (event.resource === "/request_accesstoken") {
       // 認可コードを受け取りアクセストークンを発行する
       let params = {};
       if (event.headers["Content-Type"] === "application/x-www-form-urlencoded") {
           event.body.split("&").forEach(value => {
               const keyValue = value.split("=");
               params[keyValue[0]] = keyValue[1];
           })
       } else {
           params = JSON.parse(event.body);
       }
       const result =  await request_accesstoken(params, event.headers.Authorization);
       logger.info(JSON.stringify(result));
       logger.info(event);
       logger.info(context);
       return result;
   } else if (event.resource === "/start_link") {
        // アカウントリンクURLの通知
        if(!session) {
            session = await db.publishSession();
        }
        return await start_link(event.queryStringParameters, session, event.requestContext.stage);
    }
    else if(event.resource === "/enable_skill") {
        try {
            const result =  await enable_skill(event.queryStringParameters,session, event.requestContext.stage);
            return result;
        } catch(err) {
            logger.error(`Unexpected error(enable_skill)->${err}`)
            logger.error(event)
            logger.error(context)
        }
    }
    return error_def.UserError;
};