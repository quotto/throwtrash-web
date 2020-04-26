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

const mockResult = []
const mockData = [
    [
        {type: "burn",schedules:[{type: "weekday",value: "1"}]}
    ]
]
jest.mock("../dbadapter")
const db = require("../dbadapter");
db.getDataBySigninId.mockImplementation(async (signinId) => {
    if (signinId === "signinid-error") {
        throw new Error("Test Exception");
    }else if(signinId === "amazon-xxxxx") {

        return {id: "id001", description: JSON.stringify(mockData[0],null,2)}
    } else if(signinId === "google-xxxxx") {
        return {id: "id002", description: JSON.stringify(mockData[0],null,2)}
    }
    return {};
});
db.saveSession.mockImplementation(async (session) => {
    mockResult[session.id] = session;
    return true;
});
const signin = require("../signin");

describe('signin', () => {
    beforeEach(() => {
        signin.__set__({
            requestAmazonProfile:async (_access_token) => { return { id: 'amazon-xxxxx', name: 'テスト' }},
            requestGoogleProfile:async (_code,_domain,_stage) => { 
                if(_code === "12345") {
                    return { id: 'google-xxxxx', name: 'テスト' }
                } else {
                    return {id: "google-yyyyy", name: "テスト2"}
                }
            }
        });
    });
    it('amazon', async () => {
        // パラメータはqueryStringParameters,ドメイン名,APIステージ
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id001'}, 'backend.mythrowaway.net', 'dev');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe('https://accountlink.mythrowaway.net/dev/index.html')
        expect(response.headers['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id001"];
        expect(session.userInfo.id).toBe("id001");
        expect(JSON.stringify(session.userInfo.preset)).toBe(JSON.stringify(mockData[0]));
        expect(session.userInfo.signinId).toBe("amazon-xxxxx");
        expect(session.userInfo.name).toBe("テスト");
        expect(session.userInfo.signinService).toBe("amazon");
    });
    it('google', async () => {
        const response = await signin({ code: '12345', state: 'google-state-value', service: 'google' }, { id: 'session-id002',  googleState: 'google-state-value' },'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe('https://accountlink.mythrowaway.net/test/index.html');
        expect(response.headers['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id002"];
        expect(session.userInfo.id).toBe("id002");
        expect(JSON.stringify(session.userInfo.preset)).toBe(JSON.stringify(mockData[0]));
        expect(session.userInfo.signinId).toBe("google-xxxxx");
        expect(session.userInfo.name).toBe("テスト");
        expect(session.userInfo.signinService).toBe("google");
    })
    it('まだ登録したことがない（idなし）', async () => {
        const response = await signin({ code: '5678', state: 'google-state-value', service: 'google' }, { id: 'session-id003', googleState: 'google-state-value' },'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe('https://accountlink.mythrowaway.net/test/index.html');
        expect(response.headers['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id003"];
        expect(session.userInfo.id).toBeUndefined();
        expect(JSON.stringify(session.userInfo.preset)).toBe("[]");
        expect(session.userInfo.signinId).toBe("google-yyyyy");
        expect(session.userInfo.name).toBe("テスト2");
        expect(session.userInfo.signinService).toBe("google");
    })
    it('規定外のサービス', async () => {
        const response = await signin({ code: '12345', service: 'another' }, { id: 'session-id'}, 'backend.mythrowaway.net','test');
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
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id'}, 'backend.mythrowaway.net', 'test');
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
        const response = await signin({ service: 'google' }, { id: 'session-id'}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（Google,state不一致）', async () => {
        const response = await signin({ code: 1234, service: 'google', state: 'invalid-state' }, { id: 'session-id', state: 'valid-state' }, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラメーターの不足（Google,stateが無い）', async () => {
        const response = await signin({ code: '12345', service: 'google' }, { id: 'session-id'}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（amazon,access_tokenが無い）', async () => {
        const response = await signin({ service: 'amazon' }, { id: 'session-id'}, 'backend.mythrowaway.net', 'test');
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