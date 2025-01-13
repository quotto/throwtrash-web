import db from "./dbadapter";
import property from "./property";
import error_def from "./error_def";
import {BackendResponse, SessionItem} from "./interface";

export default async (params: any,session: SessionItem,new_flg: boolean,stage: string): Promise<BackendResponse>=> {
    const front_end_stage = process.env.FRONT_END_STAGE || stage;
    if(params && params.state && params.client_id && params.redirect_uri && params.platform && stage) {
        session.state = params.state;
        session.client_id = params.client_id;
        session.redirect_uri = params.redirect_uri;
        session.platform = params.platform;

        if(await db.saveSession(session)) {
            const response: BackendResponse =  {
                statusCode: 301,
                headers: {
                    Location: `https://${process.env.FRONT_END_HOST}/${front_end_stage}/index.html`
                }
            };
            if(new_flg) {
               response.headers!["Set-Cookie"] = `${property.SESSIONID_NAME}=${session.id};max-age=${property.SESSION_MAX_AGE};`;
            }
            return response;
        }
        return error_def.ServerError;

    }
    return error_def.UserError;
};
