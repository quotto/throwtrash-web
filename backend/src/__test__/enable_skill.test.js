const logger = require("trash-common").getLogger();
logger.LEVEL = logger.DEBUG;
const error_def = require("../error_def");

jest.mock("request-promise",()=>(async(option)=>{
    if(option.uri === "https://api.amazon.com/auth/o2/token") {
        return {
            access_token: "amazon-accesstoken001"
        }
    } else if(option.uri === "https://api.amazonalexa.com/v1/alexaApiEndpoint") {
        return {
            endpoints:[
                "alexa.endpoint.com"
            ]
        }
    } else if(option.uri === "https://alexa.endpoint.com/v1/users/~current/skills/test-skill-id-dev/enablement") {
        if(option.body.stage === "development" && option.body.accountLinkRequest.redirectUri === "https://backend.mythrowaway.net/dev/enable_skill" && option.body.accountLinkRequest.authCode === "authorization_code001" && option.body.accountLinkRequest.type === "AUTH_CODE" && option.headers.Authorization === "Bearer amazon-accesstoken001") {
            return {
                result: "success"
            }
        }
    } else if(option.uri === "https://alexa.endpoint.com/v1/users/~current/skills/test-skill-id-prod/enablement"){
        if(option.body.stage === "live" && option.body.accountLinkRequest.redirectUri === "https://backend.mythrowaway.net/v1/enable_skill" && option.body.accountLinkRequest.authCode === "authorization_code001" && option.body.accountLinkRequest.type === "AUTH_CODE" && option.headers.Authorization === "Bearer amazon-accesstoken001"){
            return {
                result: "success"
            }
        }
    }
    console.debug(option);
    throw new Error("rp error");
}));

jest.mock("../dbadapter");
const db = require("../dbadapter");
const mockPutAuthorizationCodeResult = {};
db.putAuthorizationCode.mockImplementation(async(user_id,client_id,redirect_uri,expires_in)=>{
    if(user_id === "id001") {
        mockPutAuthorizationCodeResult[user_id] =
        {
            code: "authorization_code001",
            user_id: user_id,
            client_id: client_id,
            redirect_uri: redirect_uri,
            expires_in: expires_in
        }
        return mockPutAuthorizationCodeResult[user_id];
    } else if(user_id === "id002") {
        throw new Error("PutAuthorizationCode Error");
    }
});
db.deleteSession.mockImplementation(async(session_id)=>{
    if(session_id === "session_id001") {
        return true;
    }
    throw new Error("delete session error");
});
const enable_skill = require("../enable_skill");
describe("enable_skill",()=>{
    describe("正常系",()=>{
        it("開発:正常終了",async()=>{
            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-dev";
            const result = await enable_skill({state: "12345"},{id: "session_id001",state: "12345", user_id: "id001"},"dev");
            
            expect(result.statusCode).toBe(301);
            expect(result.headers.Location).toBe("https://accountlink.mythrowaway.net/dev/accountlink-complete.html");

            // putAuthorizationCodeの結果
            expect(mockPutAuthorizationCodeResult["id001"]).toMatchObject({
                code: "authorization_code001",
                user_id: "id001",
                client_id: "alexa-skill",
                redirect_uri: "https://backend.mythrowaway.net/dev/enable_skill",
                expires_in: 300
            });
        });
        it("本番:正常終了",async()=>{
            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-prod";
            const result = await enable_skill({state: "12345"},{id: "session_id001",state: "12345", user_id: "id001"},"v1");
            
            expect(result.statusCode).toBe(301);
            expect(result.headers.Location).toBe("https://accountlink.mythrowaway.net/v1/accountlink-complete.html");

            // putAuthorizationCodeの結果
            expect(mockPutAuthorizationCodeResult["id001"]).toMatchObject({
                code: "authorization_code001",
                user_id: "id001",
                client_id: "alexa-skill",
                redirect_uri: "https://backend.mythrowaway.net/v1/enable_skill",
                expires_in: 300
            });
        })
    })
    describe("異常系",()=>{
        it("stateが一致しない",async()=>{
            const result = await enable_skill({state: "not_match_state"}, {state: "12345"}, "v1");
            expect(result.statusCode).toBe(301);
            const headers = result.headers;
            expect(headers.Location).toBe(error_def.UserError.headers.Location);
        });
        it("DBエラー",async()=>{
            const result = await enable_skill({state: "12345"},{state: "12345", id: "session_id002",user_id: "id002"}, "v1");
            expect(result.statusCode).toBe(301);
            const headers = result.headers;
            expect(headers.Location).toBe(error_def.ServerError.headers.Location);
        });
    });
});