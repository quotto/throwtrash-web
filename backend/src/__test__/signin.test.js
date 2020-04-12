/* eslint-disable no-unused-vars */
const URL_400 = 'https://accountlink.mythrowaway.net/400.html';
const URL_500 = 'https://accountlink.mythrowaway.net/500.html';

jest.mock("request-promise", () => (async (params) => {
    if(params.uri === "https://api.amazon.com/user/profile") {
        if (params.qs.access_token === "token-001") {
            return {
                statusCode: 200,
                body: {
                    user_id: "id-001",
                    name: "name-001"
                }
            }
        } else if (params.qs.access_token === "token-002") {
            return {
                statusCode: 500
            }
        } else if (params.qs.access_token === "token-003") {
            throw new Error("Test Exception");
        }
    } else if(params.uri === "https://oauth2.googleapis.com/token") {
        if(params.body.code === "code-001") {
            return {
                id_token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZC0wMDEiLCJuYW1lIjoibmFtZS0wMDEifQ.u9_JK3rsJiap2cr5SiJWoU3pgo2Y71xKWTtpova2-JU"
            }
        } else if (params.body.code === "code-002") {
            return {
                statusCode: 500
            }
        } else if (params.body.code === "code-003") {
            throw new Error("Test Exception");
        }

    }
}));


jest.mock("../dbadapter", () => (
    {
        getDataBySigninId: async (signinId) => {
            if (signinId === "signinid-error") {
                throw new Error("Test Exception");
            }
            return { id: signinId, description: "{}" };
        },
        saveSession: async (_session) => {
            return true;
        }
    }
))
const signin = require("../signin");

describe('signin', () => {
    beforeEach(() => {
        signin.__set__({
            requestAmazonProfile:async (_access_token) => { return { id: 'amazon-xxxxx', name: 'テスト' }},
            requestGoogleProfile:async (_code,_domain,_stage) => { return { id: 'google-xxxxx', name: 'テスト' }}
        });
    });
    it('amazon', async () => {
        // パラメータはqueryStringParameters,ドメイン名,APIステージ
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'dev');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe('https://accountlink.mythrowaway.net/v7/index.html')
        expect(response.headers['Cache-Control']).toBe('no-store');
    });
    it('google', async () => {
        const response = await signin({ code: '12345', state: 'google-state-value', service: 'google' }, { id: 'session-id', version: 7, googleState: 'google-state-value' },'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe('https://accountlink.mythrowaway.net/v7/index.html');
        expect(response.headers['Cache-Control']).toBe('no-store');
    })
    it('規定外のサービス', async () => {
        const response = await signin({ code: '12345', service: 'another' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net','test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    })
    it('セッションIDが無い', async () => {
        const response = await signin({ code: '12345', service: 'another' }, undefined, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        // セッションIDの不正はユーザーエラー
        expect(response.headers.Location).toBe(URL_400);
    })
    it('サービスへのリクエストエラー', async () => {
        // eslint-disable-next-line no-unused-vars
        const requestAmazonProfile = signin.__get__("requestAmazonProfile");
        signin.__set__({
            requestAmazonProfile: async (_access_token) => {throw new Error("Test Exception")}
        });
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        // サービスリクエスト異常はサーバーエラー
        expect(response.headers.Location).toBe(URL_500);

        signin.__set__({
            requestAmazonProfile: requestAmazonProfile
        });
    });
    it('データ取得で異常', async () => {
        const requestAmazonProfile = signin.__get__("requestAmazonProfile");
        signin.__set__({
            requestAmazonProfile: async (_access_token) => {return{id: "signinid-error"}}
        });
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id' }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        // 登録データ取得異常はサーバーエラー
        expect(response.headers.Location).toBe(URL_500);

        signin.__set__({
            requestAmazonProfile: requestAmazonProfile
        });
    });
    it('パラーメーターの不足（Google,codeがない）', async () => {
        const response = await signin({ service: 'google' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（Google,state不一致）', async () => {
        const response = await signin({ code: 1234, service: 'google', state: 'invalid-state' }, { id: 'session-id', version: 7, state: 'valid-state' }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラメーターの不足（Google,stateが無い）', async () => {
        const response = await signin({ code: '12345', service: 'google' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（amazon,access_tokenが無い）', async () => {
        const response = await signin({ service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（amazon,sessionが無い）', async () => {
        const response = await signin({ service: 'amazon',access_token: "12345" }, null, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
});

describe("requestAmazonProfile",()=>{
    const requestAmazonProfile = signin.__get__("requestAmazonProfile");
    it("正常リクエスト",async()=>{
        const response = await requestAmazonProfile("token-001");
        expect(response.id).toBe("id-001");
        expect(response.name).toBe("name-001");
    });
    it("ステータスコードエラー",async()=>{
        try {
            await requestAmazonProfile("token-002");
        } catch(err) {
            expect(err.message).toBe("Amazon Signin Failed")
        }
    });
    it("処理異常",async()=>{
        try {
            await requestAmazonProfile("token-003");
        } catch(err) {
            expect(err.message).toBe("Amazon Signin Failed")
        }
    });
});

describe("requestGoogleProfile",()=>{
    const requestGoogleProfile = signin.__get__("requestGoogleProfile");
    it("正常リクエスト",async()=>{
        const response = await requestGoogleProfile("code-001","domaain","dev");
        expect(response.id).toBe("id-001");
        expect(response.name).toBe("name-001");
    });
    it("ステータスコードエラー",async()=>{
        try {
            await requestGoogleProfile("code-002","domain","dev");
        } catch(err) {
            expect(err.message).toBe("Google Signin Failed")
        }
    });
    it("処理異常",async()=>{
        try {
            await requestGoogleProfile("code-003","domain","dev");
        } catch(err) {
            expect(err.message).toBe("Google Signin Failed")
        }
    });
});