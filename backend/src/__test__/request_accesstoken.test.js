/* eslint-disable no-unused-vars */
const property = require("../property");
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
    } else {
        return undefined;
    }
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
    const authorization = "Basic YWxleGEtc2tpbGw6OGg2cEd4SGRXaDhy"; //alexa-skill:8h6pGxHdWh8r
    process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
    process.env.ALEXA_USER_SECRET = "8h6pGxHdWh8r";

    it("grant_type=authorization_code",async()=>{
       const params = {
           code: "12345",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params,authorization);
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
    it("grant_type=refresh_token",async()=>{
       const params = {
           grant_type: "refresh_token",
           refresh_token: "refreshtoken004",
           client_id: "alexa-skill"
       }
       const result = await request_accesstoken(params,authorization);
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
        const result = await request_accesstoken({grant_type: "authorization_code",code: "99999"},authorization);
        expect(result.statusCode).toBe(500);
    });
    it("AccessToken登録エラー",async()=>{
       const params = {
           code: "56789",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params,authorization);
       console.log(result);
       expect(result.statusCode).toBe(500);
    });
    it("RefreshToken登録エラー",async()=>{
       const params = {
           code: "00000",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params,authorization);
       console.log(result);
       expect(result.statusCode).toBe(500);
    });
    it("RefreshToken取得エラー",async()=>{
       const params = {
           grant_type: "refresh_token",
           client_id: "alexa-skill",
           refresh_token: "error_refreshtoken"
       }
       const result = await request_accesstoken(params,authorization);
       console.log(result);
       expect(result.statusCode).toBe(500);
    });
    describe("パラメータエラー",()=>{
        it("grant_typeが一致しない",async()=>{
            const result = await  request_accesstoken({grant_type: "error"},authorization);
            expect(result.statusCode).toBe(400);
        });
        it("client_idが一致しない",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "invalid-client",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
            }
            const result = await  request_accesstoken(params,authorization);
            expect(result.statusCode).toBe(400);
        });
        it("redirect_uriが一致しない",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "invalid-uri"
            }
            const result = await  request_accesstoken(params,authorization);
            expect(result.statusCode).toBe(400);
        });
        it("client_idが一致しない",async()=>{
            const params = {
                grant_type: "refresh_token",
                refresh_token: "refreshtoken004",
                client_id: "invalid-client_id"
            }
            const result = await  request_accesstoken(params,authorization);
            expect(result.statusCode).toBe(400);
        });
        it("refresh_tokenが見つからない",async()=>{
            const params = {
                grant_type: "refresh_token",
                refresh_token: "not_exists_refreshtoken",
                client_id: "invalid-client_id"
            }
            const result = await  request_accesstoken(params,authorization);
            expect(result.statusCode).toBe(400);
        });
        it("Auhtorizationヘッダエラー",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
            }
            const result = await  request_accesstoken(params,"Basic abcdefg");
            expect(result.statusCode).toBe(401);
        });
    });
});