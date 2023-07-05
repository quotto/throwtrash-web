import { getLogger, TrashData } from "trash-common";
const logger = getLogger();
import db from "./dbadapter";
import rp from "request-promise";
import jwt from "jsonwebtoken";
import error_def from "./error_def";
import {BackendResponse, RawTrasScheduleItem, SessionItem } from "./interface";

interface SigninProfile {
    id: string,
    name: string
}

const requestAmazonProfile = (access_token: string): Promise<SigninProfile> =>{
    return rp({
        uri: "https://api.amazon.com/user/profile",
        qs: {
            access_token: access_token
        },
        resolveWithFullResponse: true,
        json: true
    }).then((response: any) => {
        logger.debug("signin on amazon:"+JSON.stringify(response));
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

const requestGoogleProfile = (code: string,domain: string,stage: string): Promise<SigninProfile> =>{
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
    return rp(options).then((response: any)=>{
        logger.debug("sign in on google:"+JSON.stringify(response));
        if(response.id_token) {
            const decoded_token = jwt.decode(response.id_token);
            if(decoded_token && typeof(decoded_token) != "string") {
                return {id: decoded_token["sub"], name: decoded_token["name"]};
            }
        }
        logger.error(JSON.stringify(response));
        throw new Error("Signin Failed");
    }).catch(err=>{
        logger.error(err);
        throw new Error("Google Signin Failed");
    });
}

export default async(params: any,session: SessionItem,domain: string,stage: string): Promise<BackendResponse> =>{
    let service_request = null;
    if (params.service === "amazon" && params.access_token && session) {
        service_request = requestAmazonProfile(params.access_token);
    } else if(params.service === "google"
                && params.code && params.state
                && session && params.state === session.googleState) {
        service_request = requestGoogleProfile(params.code,domain,stage);
    }  else {
        logger.error("invalid parameter ->");
        logger.error(params);
        logger.error(JSON.stringify(session));
        return error_def.UserError;
    }

    try {
        const user_info: SigninProfile = await service_request;
        const user_data: RawTrasScheduleItem | {} = await db.getDataBySigninId(user_info.id);
        session.userInfo = {
            signinId: user_info.id,
            name: user_info.name,
            signinService: params.service,
            preset: []
        };
        if ("id" in user_data) {
            session.userInfo.id = user_data.id;
            session.userInfo.preset = JSON.parse(user_data.description);
        }

        if (await db.saveSession(session)) {
            const front_end_stage = process.env.FRONT_END_STAGE || stage;
            return {
                statusCode: 301,
                headers: {
                    Location: `https://accountlink.mythrowaway.net/${front_end_stage}/index.html`,
                    "Cache-Control": "no-store"
                }
            }
        }
        return error_def.UserError;
    } catch(err: any) {
        logger.error(err);
        return error_def.ServerError;
    }
}