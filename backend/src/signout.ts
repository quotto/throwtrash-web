import { getLogger } from "trash-common";
const logger = getLogger();
import property from "./property";
import db from "./dbadapter";
import {BackendResponse} from "./interface";
export default async(session: any)=>{
    if(session.userInfo) {
        logger.info("signout:"+session.userInfo.signinId);
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
    logger.warn("not signed in user");
    return {
        statusCode: 200,
        body: "",
        headers: {
            "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
            "Access-Control-Allow-Credentials": true
        }
    }
}