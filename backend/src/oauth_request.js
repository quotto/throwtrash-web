const db = require("./dbadapter");
const property = require("./property");
const error_def = require("./error_def");


module.exports = async (params,session,new_flg)=> {
    if(params && params.state && params.client_id && params.redirect_uri && params.version && params.platform) {
        session.state = params.state;
        session.client_id = params.client_id;
        session.redirect_uri = params.redirect_uri;
        session.version = params.version;
        session.platform = params.platform;

        if(await db.saveSession(session)) {
            const response =  {
                statusCode: 301,
                headers: {
                    Location: `https://accountlink.mythrowaway.net/v${params.version}/index.html`
                }
            };
            if(new_flg) {
               response.headers["Set-Cookie"] = `${property.SESSIONID_NAME}=${session.id};max-age=${property.SESSION_MAX_AGE};`;
            }
            return response;
        }
        return error_def.ServerError;

    } 
    return error_def.UserError;
};
