const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.DB_REGION });
const property = require("./property");
const common = require("trash-common");

const putAccessToken = async(user_id,client_id)=>{
    let limit = 0;
    while(limit < 5) {
        const accessToken = {
                token: common.generateRandomCode(20),
                // expires_in: Date.now() + 7 * 24 * 60 * 60 * 1000,
                expires_in: Date.now() + 60 * 1000,
        };
        try {
            await documentClient.put({
                TableName: property.TOKEN_TABLE,
                Item: {
                    access_token: accessToken.token,
                    expires_in: Math.ceil(accessToken.expires_in/1000),
                    user_id: user_id,
                    client_id: client_id
                },
                ConditionExpression: "attribute_not_exists(access_token)"
            }).promise();
            return accessToken;
        } catch(err) {
            console.warn(err);
        }
        limit++;
    }
    throw new Error("Put Access Token Failed.");
}

const putRefreshToken = async(user_id,client_id)=>{
    let limit = 0;
    while(limit < 5) {
        const refreshToken = {
            token: common.generateRandomCode(20),
            expires_in: Math.ceil(Date.now() / 1000) + 30 * 24 * 60 * 60,
        };
        try {
            await documentClient.put({
                TableName: property.REFRESH_TABLE,
                Item: {
                    refresh_token: refreshToken.token,
                    expires_in: Math.ceil(refreshToken.expires_in/1000),
                    user_id: user_id,
                    client_id: client_id
                },
                ConditionExpression: "attribute_not_exists(refresh_token)"
            }).promise();
            return refreshToken;
        } catch(err) {
            console.warn(err);
        }
        limit++;
    }
    throw new Error("Put Refresh Token Failed.");
}
module.exports = async (params) => {
    console.debug(JSON.stringify(params));
    if (params.grant_type === "authorization_code") {
        try {
            const result = await documentClient.get({
                TableName: property.AUTHORIZE_TABLE,
                Key: {
                    code: params.code
                }
            }).promise();
            const authorizationCode = result.Item
            if (authorizationCode &&
                params.client_id === authorizationCode.client_id &&
                decodeURIComponent(params.redirect_uri) === authorizationCode.redirect_uri){
                    // アクセストークンの登録
                    const accessToken = await putAccessToken(authorizationCode.user_id, params.client_id);

                    // リフレッシュトークンの登録
                    const refreshToken = await putRefreshToken(authorizationCode.user_id,params.client_id);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            access_token: accessToken.token,
                            token_type: "bearer",
                            expires_in: accessToken.expires_in,
                            refresh_token: refreshToken.token
                        }),
                        headers: {
                            Pragma: "no-cache",
                            "Content-Type": "application/json;charset UTF-8",
                            "Cache-Control": "no-store"
                        }
                    }
            } else {
                console.error(`authorization code not found: ${JSON.stringify(authorizationCode)}`);
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