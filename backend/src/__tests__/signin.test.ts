jest.setTimeout(100000);
import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();

import db from "../dbadapter";

import { SessionItem } from "../interface";

const URL_400 = 'https://accountlink.mythrowaway.net/400.html';
const URL_500 = 'https://accountlink.mythrowaway.net/500.html';

const mockResult: {[key: string]: SessionItem} = {};
const mockData = [
    [
        {type: "burn",schedules:[{type: "weekday",value: "1"}]}
    ]
]
jest.mock("../dbadapter")
jest.mocked(db.getDataBySigninId).mockImplementation(async (signinId) => {
    if (signinId === "signinid-error") {
        throw new Error("Test Exception");
    }else if(signinId === "amazon-xxxxx") {

        return {id: "id001", description: JSON.stringify(mockData[0],null,2)}
    } else if(signinId === "google-xxxxx") {
        return {id: "id002", description: JSON.stringify(mockData[0],null,2)}
    }
    return {};
});
jest.mocked(db.saveSession).mockImplementation(async (session) => {
    mockResult[session.id] = session;
    return true;
});

jest.mock("request-promise",()=>({
    __esModule: true,
    default: async(options: any)=>{
        if(options.uri === "https://api.amazon.com/user/profile") {
            if (options.qs.access_token === "token-001") {
                return {
                    statusCode: 200,
                    body: {
                        user_id: "amazon-xxxxx",
                        name: "テスト1"
                    }
                }
            } else if (options.qs.access_token === "token-002") {
                return {
                    statusCode: 500
                }
            } else if (options.qs.access_token === "token-003") {
                throw new Error("Test Exception");
            }
        } else if(options.uri === "https://oauth2.googleapis.com/token") {
            if(options.body.code === "code-001") {
                return {
                    id_token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUteHh4eHgiLCJuYW1lIjoi44OG44K544OIMSJ9.rfbozVsH7JzyYRLYoVPe2astjxiAT-TyjFoDXsTGovk"
                }
            } else if (options.body.code === "code-002") {
                return {
                    statusCode: 500
                }
            } else if (options.body.code === "code-003") {
                throw new Error("Test Exception");
            } else if(options.body.code === "code-004") {
                return {
                    id_token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUteXl5eXkiLCJuYW1lIjoi44OG44K544OIMiJ9.BV3RQjYOJ5ZSmCeUpsLQ89y6YLY84FPEMedn6NFSftQ"
                }

            }
        }
    }
}));

import signin from "../signin";
describe('signin', () => {
    it('amazon', async (): Promise<void> => {
        // パラメータはqueryStringParameters,ドメイン名,APIステージ
        const response = await signin({ access_token: 'token-001', service: 'amazon' }, { id: 'session-id001', expire: 999998}, 'backend.mythrowaway.net', 'dev');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe('https://accountlink.mythrowaway.net/dev/index.html')
        expect(response.headers!['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id001"];
        expect(session.userInfo).not.toBeUndefined();
        expect(session.userInfo!.id).toBe("id001");
        expect(JSON.stringify(session.userInfo!.preset)).toBe(JSON.stringify(mockData[0]));
        expect(session.userInfo!.signinId).toBe("amazon-xxxxx");
        expect(session.userInfo!.name).toBe("テスト1");
        expect(session.userInfo!.signinService).toBe("amazon");
    });
    it('google', async () => {
        const response = await signin({ code: 'code-001', state: 'google-state-value', service: 'google' }, { id: 'session-id002',  googleState: 'google-state-value',expire: 9999999 },'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe('https://accountlink.mythrowaway.net/test/index.html');
        expect(response.headers!['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id002"];
        expect(session.userInfo).not.toBeUndefined();
        expect(session.userInfo!.id).toBe("id002");
        expect(JSON.stringify(session.userInfo!.preset)).toBe(JSON.stringify(mockData[0]));
        expect(session.userInfo!.signinId).toBe("google-xxxxx");
        expect(session.userInfo!.name).toBe("テスト1");
        expect(session.userInfo!.signinService).toBe("google");
    })
    it('まだ登録したことがない（idなし）', async () => {
        const response = await signin({ code: 'code-004', state: 'google-state-value', service: 'google' }, { id: 'session-id003', googleState: 'google-state-value',expire: 9999999 },'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe('https://accountlink.mythrowaway.net/test/index.html');
        expect(response.headers!['Cache-Control']).toBe('no-store');

        // 保存されたセッション
        const session = mockResult["session-id003"];
        expect(session.userInfo).not.toBeUndefined();
        expect(session.userInfo!.id).toBeUndefined();
        expect(JSON.stringify(session.userInfo!.preset)).toBe("[]");
        expect(session.userInfo!.signinId).toBe("google-yyyyy");
        expect(session.userInfo!.name).toBe("テスト2");
        expect(session.userInfo!.signinService).toBe("google");
    })
    it('規定外のサービス', async () => {
        const response = await signin({ code: '12345', service: 'another' }, { id: 'session-id',expire: 9999999}, 'backend.mythrowaway.net','test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe(URL_400);
    })
    it('サービスへのリクエストエラー', async () => {
        const response = await signin({ access_token: 'token-002', service: 'amazon' }, { id: 'session-id',expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        // サービスリクエスト異常はサーバーエラー
        expect(response.headers!.Location).toBe(URL_500);
    });
    it('データ取得で異常', async () => {
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id' ,expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        // 登録データ取得異常はサーバーエラー
        expect(response.headers!.Location).toBe(URL_500);
    });
    it('パラーメーターの不足（Google,codeがない）', async () => {
        const response = await signin({ service: 'google' }, { id: 'session-id',expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（Google,state不一致）', async () => {
        const response = await signin({ code: 1234, service: 'google', state: 'invalid-state' }, { id: 'session-id', state: 'valid-state' ,expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe(URL_400);
    });
    it('パラメーターの不足（Google,stateが無い）', async () => {
        const response = await signin({ code: '12345', service: 'google' }, { id: 'session-id',expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe(URL_400);
    });
    it('パラーメーターの不足（amazon,access_tokenが無い）', async () => {
        const response = await signin({ service: 'amazon' }, { id: 'session-id',expire: 9999999}, 'backend.mythrowaway.net', 'test');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe(URL_400);
    });
    it('requestAmazonProfileで異常終了',async ()=>{
        try {
            const response = await signin({ access_token: 'token-003', service: 'amazon' }, { id: 'session-id001', expire: 999998}, 'backend.mythrowaway.net', 'dev');
        } catch(err: any) {
            expect(err.message).toBe("Amazon Signin Failed")
        }
    });
    it("requestGoogleProfileで異常終了",async()=>{
        try {
            const response = await signin({ code: 'code-003', state: 'google-state-value', service: 'google' }, { id: 'session-id002',  googleState: 'google-state-value',expire: 9999999 },'backend.mythrowaway.net', 'test');
        } catch(err: any) {
            expect(err.message).toBe("Google Signin Failed")
        }
    });

});