/* eslint-disable no-unused-vars */
const logger = require("trash-common").getLogger();
logger.LEVEL = logger.DEBUG;

const property = require("../property");

const todayMillis = Date.UTC(2020,4,20,12,0,0,0);
Date.now = jest.fn().mockReturnValue(todayMillis);

// データ登録系処理の結果確認のための入れ物
const mockScheduleResult = {};
const mockAuthResult = {};
jest.mock("../dbadapter");
const db = require("../dbadapter");
db.publishId.mockImplementation(async()=>{return "id001"});
db.putTrashSchedule.mockImplementation(async(item)=>{
            mockScheduleResult[item.id] = item;
            return true;
        });
db.deleteSession.mockImplementation(async(_sessionid)=>{return true});
db.putAuthorizationCode.mockImplementation(async(user_id,client_id,redirect_uri,expire)=>{
    const result = {
        code: "12345",
        user_id: user_id,
        client_id: client_id,
        redirect_uri: redirect_uri,
        expires_in: Math.ceil(todayMillis/1000) + expire
    }
    mockAuthResult[result.code] = result;
    return result;
});

const register = require("../register");
describe('register', () => {
    it('正常なリクエスト', async () => {
        // パラメータはリクエストパラメータ（登録データ）とセッション情報
        // セッションIDは呼び出し前に採番されるため、セッション情報は必ず存在する
        const response = await register({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] },
            { id: 'sessionid-001', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('https://xxxx.com?state=state-value&code=12345');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
        expect(response.headers['Cache-Control']).toBe("no-store");

        // TrashScheduleに登録されたデータの確認
        expect(mockScheduleResult["id001"].id).toBe("id001");
        expect(mockScheduleResult["id001"].platform).toBe("amazon");
        expect(mockScheduleResult["id001"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }], null, 2) );

        // AuthorizationCodeに登録されたデータの確認
        const auth = mockAuthResult["12345"];
        expect(auth.user_id).toBe("id001");
        expect(auth.client_id).toBe("alexa-skill");
        expect(auth.redirect_uri).toBe("https://xxxx.com");
        expect(auth.expires_in).toBe(Math.ceil(todayMillis/1000)+300);
    });
    it('サインイン済み,id無し', async () => {
        const response = await register({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] },
            { id: 'sessionid-001', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' ,
            userInfo: {
                signinId: "signinId002",
                signinService: "google"
            }
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('https://xxxx.com?state=state-value&code=12345');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
        expect(response.headers['Cache-Control']).toBe("no-store");

        // TrashScheduleに登録されたデータの確認
        expect(mockScheduleResult["id001"].id).toBe("id001");
        expect(mockScheduleResult["id001"].platform).toBe("amazon");
        expect(mockScheduleResult["id001"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }],null,2));
        expect(mockScheduleResult["id001"].signinId).toBe("signinId002");
        expect(mockScheduleResult["id001"].signinService).toBe("google");

        // AuthorizationCodeに登録されたデータの確認
        const auth = mockAuthResult["12345"];
        expect(auth.user_id).toBe("id001");
        expect(auth.client_id).toBe("alexa-skill");
        expect(auth.redirect_uri).toBe("https://xxxx.com");
        expect(auth.expires_in).toBe(Math.ceil(todayMillis/1000)+300);
    });
    it('サインイン済み,idあり', async () => {
        const response = await register({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] },
            { id: 'sessionid-001', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' ,
            userInfo: {
                id: "id003",
                signinId: "signinId002",
                signinService: "google"
            }
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('https://xxxx.com?state=state-value&code=12345');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
        expect(response.headers['Cache-Control']).toBe("no-store");

        // TrashScheduleに登録されたデータの確認
        expect(mockScheduleResult["id003"].id).toBe("id003");
        expect(mockScheduleResult["id003"].platform).toBe("amazon");
        expect(mockScheduleResult["id003"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }],null,2));
        expect(mockScheduleResult["id003"].signinId).toBe("signinId002");
        expect(mockScheduleResult["id003"].signinService).toBe("google");

        // AuthorizationCodeに登録されたデータの確認
        const auth = mockAuthResult["12345"];
        expect(auth.user_id).toBe("id003");
        expect(auth.client_id).toBe("alexa-skill");
        expect(auth.redirect_uri).toBe("https://xxxx.com");
        expect(auth.expires_in).toBe(Math.ceil(todayMillis/1000)+300);
    });
    it("bodyがnull",async()=>{
        const register = require("../register");
        const response = await register(null,{id: "sessionid-002"});
        expect(response.statusCode).toBe(400);
        expect(response.body).toBe("Invalid Parameters");
    });
    it("sessionがnull",async()=>{
        const register = require("../register");
        const response = await register({},null);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBe("Invalid Parameters");
    });
    it("登録データ異常",async()=>{
        // otherにtrash_valがないためエラー
        const response = await register({ data: [{ type: 'other', schedules: [{ type: 'weekday', value: '0' }] }] }, { id: 'sessionid-004', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe("Bad Data");
    });
    it("DB処理でエラー",async()=>{
        const db = require("../dbadapter");
        db.publishId = async()=>{throw new Error("Test Exception")}
        const response = await register({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] }, { id: 'sessionid-005', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' })

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe("Registration Failed");
    })
});

describe("adjustData",()=>{
    const adjustData = register.__get__("adjustData");
    it('一つ以上のスケジュール登録があれば正常', async () => {
        const response = adjustData([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' },{ "type": "none", "value": "" }, { "type": "none", "value": "" }] }],540);
        expect(JSON.stringify(response)).toBe("[{\"type\":\"burn\",\"schedules\":[{\"type\":\"weekday\",\"value\":\"0\"}]}]");
    });
    it('trash.type=other', async () => {
        const response = adjustData([{ type: 'other',trash_val:"萌えるゴミ",schedules: [{ type: 'weekday', value: '0' },{ "type": "none", "value": "" }, { "type": "none", "value": "" }] }],540);
        expect(JSON.stringify(response)).toBe("[{\"type\":\"other\",\"trash_val\":\"萌えるゴミ\",\"schedules\":[{\"type\":\"weekday\",\"value\":\"0\"}]}]");
    });
    it('evweek & start on saturday', async () => {
        const response = adjustData([{ type: 'other',trash_val:"萌えるゴミ",schedules: [{ type: 'evweek', value: {weekday:'0',start: '2020-10-02', interval: 2 }}]}],540);
        expect(response[0].schedules[0].value.start).toBe("2020-9-27");
    });
    it('evweek & start on sunday', async () => {
        const response = adjustData([{ type: 'other',trash_val:"萌えるゴミ",schedules: [{ type: 'evweek', value: {weekday:'0',start: '2020-09-27', interval: 3 }}]}],540);
        expect(response[0].schedules[0].value.start).toBe("2020-9-27");
    });
    it('nullのためエラー', async () => {
        const response = adjustData(null,540);
        expect(JSON.stringify(response)).toBe("[]");
    });
    it('undefinedのためエラー', async () => {
        const response = adjustData(undefined,540);
        expect(JSON.stringify(response)).toBe("[]");
    });
    it('配列を持たない要素がある', async () => {
        const response = adjustData([
            {type: 'burn', schedules: [{ type: 'weekday', value: '0' }]},
            {}
        ],540);
        expect(JSON.stringify(response)).toBe("[{\"type\":\"burn\",\"schedules\":[{\"type\":\"weekday\",\"value\":\"0\"}]}]");
    });
});