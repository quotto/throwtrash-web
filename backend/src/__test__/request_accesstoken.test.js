/* eslint-disable no-unused-vars */
const logger = require("trash-common").getLogger();
logger.LEVEL = logger.DEBUG;
const error_def = require("../error_def");

const mockDate = Date.UTC(2020,3,1,12,0,0,0);
const mockResult = { };

jest.mock("../dbadapter");
const db = require("../dbadapter");
db.getAuthorizationCode.mockImplementation(async (code) => {
    if (code === "12345") {
        return {
            code: code, user_id: "id001", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX"
        };
    } else if (code === "56789") {
        return {
            code: code, user_id: "id002", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX"
        };
    } else if (code === "00000") {
        return {
            code: code, user_id: "id003", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX"
        };
    } else if (code === "99999") {
        throw new Error("Get code Error");
    } else if (code === "g0123") {
        return {
            code: code, user_id: "id-google-001", client_id: "google", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX"
        };
    } else {
        return undefined;
    }
});
db.deleteAuthorizationCode.mockImplementation(async(code)=>{
    return {};
});
db.putAccessToken.mockImplementation(async (user_id, client_id, expires_in) => {
    if (user_id === "id001") {
        mockResult["accesstoken001"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate / 1000) + expires_in
        }
        return "accesstoken001";
    } else if (user_id === "id002") {
        throw new Error("AccessToken DB Error");
    } else if (user_id === "id004") {
        mockResult["accesstoken004"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate / 1000) + expires_in
        }
        return "accesstoken004";
    } else if(user_id === "id-google-001") {
        mockResult["accesstoken-google-001"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate / 1000) + expires_in
        }
        return "accesstoken-google-001";
    }
});
db.putRefreshToken.mockImplementation(async (user_id, client_id, expires_in) => {
    if (user_id === "id001") {
        mockResult["refreshtoken001"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate/1000) + expires_in
        }
        return "refreshtoken001";
    } else if (user_id === "id003") {
        throw new Error("RfreshToken DB Error");
    } else if (user_id === "id004") {
        mockResult["refreshtoken004"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate/1000) + expires_in
        }
        return "new_refreshtoken004";
    } else if (user_id === "id-google-001") {
        mockResult["refreshtoken-google-001"] = {
            client_id: client_id,
            expires_in: Math.ceil(mockDate/1000) + expires_in
        }
        return "refreshtoken-google-001";
    }
});
db.getRefreshToken.mockImplementation(async(refresh_token) => {
    if (refresh_token === "refreshtoken004") {
        return {
            user_id: "id004",
            expires_in: 7 * 24 * 60 * 60,
            client_id: "alexa-skill"
        }
    } else if (refresh_token === "error_refreshtoken") {
        throw new Error("Get RefreshToken Error");
    }
    return undefined;
});

const request_accesstoken = require("../request_accesstoken.js");
describe("request_accesstoken",()=>{
    const alexaAuthorization = "Basic YWxleGEtc2tpbGw6OGg2cEd4SGRXaDhy"; //alexa-skill:8h6pGxHdWh8r
    process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
    process.env.ALEXA_USER_SECRET = "8h6pGxHdWh8r";
    process.env.GOOGLE_USER_CLIENT_ID = "google";
    process.env.GOOGLE_USER_SECRET = "543kjfdfal";

    it("grant_type=authorization_code_alexa",async()=>{
       const params = {
           code: "12345",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params,alexaAuthorization);
       console.log(result);
       expect(result.statusCode).toBe(200);

       const body = JSON.parse(result.body);
       expect(body.access_token).toBe("accesstoken001");
       expect(body.token_type).toBe("bearer");
       expect(body.refresh_token).toBe("refreshtoken001");

       const date = new Date(body.expires_in);
       expect(body.expires_in).toBe(7 * 24 * 60 * 60);

       expect(mockResult["accesstoken001"].client_id).toBe("alexa-skill");
       expect(mockResult["accesstoken001"].expires_in).toBe(Math.ceil(mockDate/1000)+(7 * 24 * 60 * 60));
       expect(mockResult["refreshtoken001"].client_id).toBe("alexa-skill");
       expect(mockResult["refreshtoken001"].expires_in).toBe(Math.ceil(mockDate/1000)+(30 * 24 * 60 * 60));
    });
    it("grant_type=authorization_code_google",async()=>{
        // googleのアカウンリンク認証はパラメータにclient_id&secretが渡される
       const params = {
           code: "g0123",
           grant_type: "authorization_code",
           client_id: "google",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
           client_secret: process.env.GOOGLE_USER_SECRET
       }
       const result = await request_accesstoken(params,undefined);
       console.log(result);
       expect(result.statusCode).toBe(200);

       const body = JSON.parse(result.body);
       expect(body.access_token).toBe("accesstoken-google-001");
       expect(body.token_type).toBe("bearer");
       expect(body.refresh_token).toBe("refreshtoken-google-001");

       const date = new Date(body.expires_in);
       expect(body.expires_in).toBe(7 * 24 * 60 * 60);

       expect(mockResult["accesstoken-google-001"].client_id).toBe("google");
       expect(mockResult["accesstoken-google-001"].expires_in).toBe(Math.ceil(mockDate/1000)+(7 * 24 * 60 * 60));
       expect(mockResult["refreshtoken-google-001"].client_id).toBe("google");
       expect(mockResult["refreshtoken-google-001"].expires_in).toBe(Math.ceil(mockDate/1000)+(30 * 24 * 60 * 60));
    });
    it("grant_type=refresh_token_alexa",async()=>{
       const params = {
           grant_type: "refresh_token",
           refresh_token: "refreshtoken004",
           client_id: "alexa-skill"
       }
       const result = await request_accesstoken(params,alexaAuthorization);
       console.log(result);
       expect(result.statusCode).toBe(200);

       const body = JSON.parse(result.body);
       expect(body.access_token).toBe("accesstoken004");
       expect(body.token_type).toBe("bearer");
       expect(body.refresh_token).toBe("new_refreshtoken004");
       expect(body.expires_in).toBe(7 * 24 * 60 * 60);

       expect(mockResult["accesstoken004"].client_id).toBe("alexa-skill");
       expect(mockResult["accesstoken004"].expires_in).toBe(Math.ceil(mockDate/1000)+(7 * 24 * 60 * 60));
       expect(mockResult["refreshtoken004"].client_id).toBe("alexa-skill");
       expect(mockResult["refreshtoken004"].expires_in).toBe(Math.ceil(mockDate/1000)+(30 * 24 * 60 * 60));
    });
    it("Authorization Code 取得エラー",async()=>{
        const result = await request_accesstoken(
            {grant_type: "authorization_code",code: "99999",client_id: "alexa-skill"},alexaAuthorization);
        expect(result).toMatchObject(error_def.ServerError);
    });
    it("AccessToken登録エラー",async()=>{
        const params = {
            code: "56789",
            grant_type: "authorization_code",
            client_id: "alexa-skill",
            redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
        }
        const result = await request_accesstoken(params, alexaAuthorization);
        console.log(result);
        expect(result).toMatchObject(error_def.ServerError);
    });
    it("RefreshToken登録エラー",async()=>{
        const params = {
            code: "00000",
            grant_type: "authorization_code",
            client_id: "alexa-skill",
            redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
        }
        const result = await request_accesstoken(params, alexaAuthorization);
        console.log(result);
        expect(result).toMatchObject(error_def.ServerError);
    });
    it("RefreshToken取得エラー",async()=>{
       const params = {
           grant_type: "refresh_token",
           client_id: "alexa-skill",
           refresh_token: "error_refreshtoken"
       }
       const result = await request_accesstoken(params,alexaAuthorization);
       console.log(result);
        expect(result).toMatchObject(error_def.ServerError);
    });
    describe("パラメータエラー",()=>{
        it("grant_typeが一致しない",async()=>{
            const result = await  request_accesstoken(
                {grant_type: "error", client_id: "alexa-skill"},alexaAuthorization);
            expect(result).toMatchObject(error_def.UserError);
        });
        it("client_idが一致しない(auhtorization_code)",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "google",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
                client_secret: process.env.GOOGLE_USER_SECRET
            }
            const result = await  request_accesstoken(params,undefined);
            expect(result).toMatchObject(error_def.UserError);
        });
        it("client_idが一致しない(refresh_token)",async()=>{
            const params = {
                grant_type: "refresh_token",
                code: "refreshtoken004",
                client_id: "google",
                client_secret: process.env.GOOGLE_USER_SECRET
            }
            const result = await  request_accesstoken(params,undefined);
            expect(result).toMatchObject(error_def.UserError);
        });
        it("redirect_uriが一致しない",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "invalid-uri"
            }
            const result = await  request_accesstoken(params,alexaAuthorization);
            expect(result).toMatchObject(error_def.UserError);
        });
        it("refresh_tokenが見つからない",async()=>{
            const params = {
                grant_type: "refresh_token",
                refresh_token: "not_exists_refreshtoken",
                client_id: "alexa-skill"
            }
            const result = await  request_accesstoken(params,alexaAuthorization);
            expect(result).toMatchObject(error_def.UserError);
        });
        it("Auhtorizationヘッダエラー",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
            }
            const result = await  request_accesstoken(params,"Basic abcdefg");
            expect(result).toMatchObject(error_def.UserError);
        });
    });
});