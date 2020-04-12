const property = require("../property");
class mockClass {
    // eslint-disable-next-line no-unused-vars
    constructor(_config){}
    get(params) {
        return {
            promise: async() => {
                if (params.Key.code === "12345") {
                    return {
                        Item: { code: params.code, user_id: "id001", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX" }
                    };
                } else if (params.Key.code === "56789") {
                    return {
                        Item: { code: params.code, user_id: "id002", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX" }
                    };
                } else if (params.Key.code === "00000") {
                    return {
                        Item: { code: params.code, user_id: "id003", client_id: "alexa-skill", redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX" }
                    };
                } else if (params.Key.code === "99999") {
                    throw new Error("Get code Error");
                } 
                else {
                    return {}
                }
            }
        }
    }
    put(params) {
        return {
            promise: async() => {
                if(params.TableName === property.TOKEN_TABLE && params.Item.user_id=="id002"){
                    throw new Error("AccessToken DB Error");
                } else if(params.TableName === property.REFRESH_TABLE && params.Item.user_id=="id003") {
                    throw new Error("RfreshToken DB Error");
                }
            }
        }
    }
}
jest.mock("aws-sdk",()=>(
    {
        DynamoDB: {
            DocumentClient: mockClass
        }
    }
));
jest.mock("trash-common",()=>(
    {
        // eslint-disable-next-line no-unused-vars
        generateRandomCode: (_length)=>{
            return "abcdefg12345";
        }
    }
));
const testDate = Date.UTC(2020,3,1,12,0,0,0);
Date.now = jest.fn().mockReturnValue(testDate);
const request_accesstoken = require("../request_accesstoken.js");
describe("request_accesstoken",()=>{
    it("正常なリクエスト",async()=>{
       const params = {
           code: "12345",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params);
       console.log(result);
       expect(result.statusCode).toBe(200);

       const body = JSON.parse(result.body);
       expect(body.access_token).toBe("abcdefg12345");
       expect(body.token_type).toBe("bearer");
       expect(body.refresh_token).toBe("abcdefg12345");

       const date = new Date(body.expires_in);
       expect(date.getUTCFullYear()).toBe(2020);
       expect(date.getUTCMonth()).toBe(3);
       expect(date.getUTCDate()).toBe(8);
       expect(date.getUTCHours()).toBe(12);
       expect(date.getUTCMinutes()).toBe(0);

    });
    it("Authorization Code 取得エラー",async()=>{
        const result = await request_accesstoken({grant_type: "authorization_code",code: "99999"});
        expect(result.statusCode).toBe(500);
    });
    it("AccessToken登録エラー",async()=>{
       const params = {
           code: "56789",
           grant_type: "authorization_code",
           client_id: "alexa-skill",
           redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
       }
       const result = await request_accesstoken(params);
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
       const result = await request_accesstoken(params);
       console.log(result);
       expect(result.statusCode).toBe(500);
    });
    describe("パラメータエラー",()=>{
        it("grant_type",async()=>{
            const result = await  request_accesstoken({grant_type: "error"});
            expect(result.statusCode).toBe(400);
        });
        it("client_id",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "invalid-client",
                redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX"
            }
            const result = await  request_accesstoken(params);
            expect(result.statusCode).toBe(400);
        });
        it("redirect_uri",async()=>{
            const params = {
                code: "12345",
                grant_type: "authorization_code",
                client_id: "alexa-skill",
                redirect_uri: "invalid-uri"
            }
            const result = await  request_accesstoken(params);
            expect(result.statusCode).toBe(400);
        });
    });
});