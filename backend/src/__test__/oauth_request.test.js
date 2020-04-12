const error_def = require("../error_def");
jest.mock("../dbadapter",()=>(
    {
        saveSession: async(session)=>{
            if(session.id === "sessionid-001") {
                return true;
            }
            return false;
        }
    }
));
describe("oauth_request", () => {
    const oauth_request = require("../oauth_request");
    it("セッションID新規発行", async () => {
        // パラメータはqueryStringParameters,セッション情報,セッション新規発行フラグ
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
            version: "5"
        }, { id: "sessionid-001", expire: 99999999 }, true);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe("https://accountlink.mythrowaway.net/v5/index.html");
        expect(headers["Set-Cookie"]).toBe("throwaway-session=sessionid-001;max-age=3600;");
    });
    it("有効なセッションIDを既に利用している場合", async () => {
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
            version: "5"
        }, { id: "sessionid-001", expire: 99999999 }, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe("https://accountlink.mythrowaway.net/v5/index.html");
        expect(headers["Set-Cookie"]).toBe(undefined);
    });
    it("セッションの保存に失敗した", async () => {
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
            version: "5"
        }, { id: "sessionid-002", expire: 99999999 }, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.ServerError.headers.Location);
    });
    it("パラメータエラー state無し", async () => {
        const response = await oauth_request({
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
            version: "5"
        });
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    }, {}, true);
    it("パラメータエラー client_id無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
            version: "5"
        }, {}, true);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー redirect_uri無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            client_id: "alexa-skill",
            platform: "amazon",
            version: "5"
        }, {}, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー バージョンなし", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon"
        }, {}, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー platform無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            version: "5"
        }, {}, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー パラメータ無し", async () => {
        const response = await oauth_request(undefined, undefined, false);
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers.Location).toBe(error_def.UserError.headers.Location);
    });
});