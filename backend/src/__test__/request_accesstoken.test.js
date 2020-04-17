/* eslint-disable no-unused-vars */
const property = require("../property");
const mockDate = Date.UTC(2020,3,1,12,0,0,0);
jest.mock("../dbadapter", () => (
    {
        getAuthorizationCode: async (code) => {
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
        },
        putAccessToken: async (user_id, client_id) => {
            if (user_id === "id001") {
                return {
                    access_token: "accesstoken001",
                    expires_in: 1586347200000,
                    user_id: user_id,
                    client_id: client_id
                }
            } else if (user_id == "id002") {
                throw new Error("AccessToken DB Error");
            }
        },
        putRefreshToken: async (user_id, client_id) => {
            if (user_id === "id001") {
                return {
                    refresh_token: "refreshtoken001",
                    expires_in: 1588334400000,
                    user_id: user_id,
                    client_id: client_id
                }
            }
            if (user_id == "id003") {
                throw new Error("RfreshToken DB Error");
            }
        }
    }
));
const request_accesstoken = require("../request_accesstoken.js");
describe("request_accesstoken",()=>{
    const authorization = "Basic YWxleGEtc2tpbGw6OGg2cEd4SGRXaDhy"; //alexa-skill:8h6pGxHdWh8r
    process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
    process.env.ALEXA_USER_SECRET = "8h6pGxHdWh8r";

    it("正常なリクエスト",async()=>{
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
       expect(date.getUTCFullYear()).toBe(2020);
       expect(date.getUTCMonth()).toBe(3);
       expect(date.getUTCDate()).toBe(8);
       expect(date.getUTCHours()).toBe(12);
       expect(date.getUTCMinutes()).toBe(0);

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
        it("Auhtorizationヘッダエラー",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
            }
            const result = await  request_accesstoken(params,"Basic abcdefg");
            expect(result.statusCode).toBe(400);
        });
    });
});