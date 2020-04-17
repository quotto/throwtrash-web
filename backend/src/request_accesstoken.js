const db = require("./dbadapter");

module.exports = async (params,authorization) => {
    console.debug(JSON.stringify(params));
    if (params.grant_type === "authorization_code") {
        try {
            const authorizationCode = await db.getAuthorizationCode(params.code);
            if (authorizationCode &&
                params.client_id === authorizationCode.client_id &&
                decodeURIComponent(params.redirect_uri) === authorizationCode.redirect_uri &&
                authorization === "Basic " + Buffer.from(`${process.env.ALEXA_USER_CLIENT_ID}:${process.env.ALEXA_USER_SECRET}`).toString("base64")){
                    // アクセストークンの登録
                    const accessToken = await db.putAccessToken(authorizationCode.user_id, params.client_id);

                    // リフレッシュトークンの登録
                    const refreshToken = await db.putRefreshToken(authorizationCode.user_id,params.client_id);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            access_token: accessToken.access_token,
                            token_type: "bearer",
                            expires_in: accessToken.expires_in,
                            refresh_token: refreshToken.refresh_token
                        }),
                        headers: {
                            Pragma: "no-cache",
                            "Content-Type": "application/json;charset UTF-8",
                            "Cache-Control": "no-store"
                        }
                    }
            } else {
                console.error(`Invalid Parameters: db-> ${JSON.stringify(authorizationCode)},params->${JSON.stringify(params)}`);
            }
        } catch(err) {
            console.error(err);
            return {
                statusCode: 500
            }
        }
    }
    return {
        statusCode: 400
    }
}