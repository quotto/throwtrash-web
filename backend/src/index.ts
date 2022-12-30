import * as common from "trash-common";
const logger = common.getLogger();
process.env.RUNLEVEL === "INFO" ? logger.setLevel_INFO() : logger.setLevel_DEBUG();

import property from "./property";
import error_def from "./error_def";
import db from "./dbadapter";
import user_info from "./user_info";
import register from "./register";
import request_accesstoken from "./request_accesstoken";
import signout from "./signout";
import signin from "./signin";
import oauth_request from "./oauth_request";
import google_signin from "./google_signin";
import { SessionItem } from "./interface";

import AWSLambda from "aws-lambda";
import request_authorization_code from "./request_authorization_code";

const extractSessionId = (cookie:string | undefined)=>{
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

exports.handler = async function(event: AWSLambda.APIGatewayEvent ,context: AWSLambda.Context) {
    logger.debug(JSON.stringify(event));
    logger.debug(JSON.stringify(context));
    let session: SessionItem | null | undefined = null;
    let sessionId: string | null = extractSessionId(event.headers.Cookie);
    logger.debug("get sessionId in cookie:"+sessionId);
    if(sessionId) {
        session = await db.getSession(sessionId);
        logger.debug("get session"+session);
    }
   if(event.resource === "/oauth_request")  {
       let new_session_flg = false;
       if(!session) {
           new_session_flg = true;
           session = await db.publishSession();
       }
       if(session) {
           return oauth_request(event.queryStringParameters, session, new_session_flg, event.requestContext.stage);
       }
   } else if(event.resource === "/google_signin") {
       if(session && event.requestContext.domainName) {
           return google_signin(session, event.requestContext.domainName, event.requestContext.stage);
       }
   } else if(event.resource === "/signin") {
       if(session && event.requestContext.domainName) {
           return signin(event.queryStringParameters,session,event.requestContext.domainName,event.requestContext.stage);
       }
   } else if(event.resource === "/signout") {
       if(session) {
           return signout(session);
       }
   } else if(event.resource === "/user_info") {
       if(session) {
        return user_info(session);
       }
   } else if(event.resource === "/regist") {
       if(session && event.body) {
           try {
               const body = JSON.parse(event.body);
               return register(body, session);
           } catch(err: any){
               logger.error(err);
           }
       }
       // /registはフォームから非同期で呼ばれるためエラーの場合は400を返す
       return {
           statusCode: 400,
           body: "Invalid Session"
       };
   } else if (event.resource === "/request_accesstoken") {
       if(event.body) {
            // 認可コードを受け取りアクセストークンを発行する
            let params: any = {};
            if (event.headers["Content-Type"] === "application/x-www-form-urlencoded") {
                event.body.split("&").forEach((value: string) => {
                    const keyValue = value.split("=");
                    params[keyValue[0]] = keyValue[1];
                })
            } else {
                params = JSON.parse(event.body);
            }
        const result =  await request_accesstoken(params, event.headers.Authorization);
        logger.info(JSON.stringify(result));
        logger.info(JSON.stringify(event));
        logger.info(JSON.stringify(context));
        return result;
       }
       logger.error("RequestAccessTokenError: event.body is null");
    } else if(event.resource === "/request_authorization_code") {
        return await request_authorization_code(event.queryStringParameters || {});
    }
    return error_def.UserError;
};