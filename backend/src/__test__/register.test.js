/* eslint-disable no-unused-vars */
const property = require("../property");

// データ登録系処理の結果確認のための入れ物
const mockResult = {};
jest.mock("../dbadapter");
const db = require("../dbadapter");
db.publishId.mockImplementation(async()=>{return "id001"});
db.putTrashSchedule.mockImplementation(async(item)=>{
            mockResult[item.id] = item;
            return true;
        });
db.deleteSession.mockImplementation(async(_sessionid)=>{return true});
db.putAuthorizationCode.mockImplementation(async(user_id,client_id,redirect_uri)=>{
            return {
                code: "12345",
                user_id: "id001",
                client_id: "alexa-skill",
                redirect_uri: "https://xxx.com",
                expiresin: 123456789
            }
        }
);
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

        // TrashScheduleに登録されたデータの確認
        expect(mockResult["id001"].id).toBe("id001");
        expect(mockResult["id001"].platform).toBe("amazon");
        expect(mockResult["id001"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }], null, 2) );
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

        // TrashScheduleに登録されたデータの確認
        expect(mockResult["id001"].id).toBe("id001");
        expect(mockResult["id001"].platform).toBe("amazon");
        expect(mockResult["id001"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }],null,2));
        expect(mockResult["id001"].signinId).toBe("signinId002");
        expect(mockResult["id001"].signinService).toBe("google");
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

        // TrashScheduleに登録されたデータの確認
        expect(mockResult["id003"].id).toBe("id003");
        expect(mockResult["id003"].platform).toBe("amazon");
        expect(mockResult["id003"].description).toBe(JSON.stringify([{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }],null,2));
        expect(mockResult["id003"].signinId).toBe("signinId002");
        expect(mockResult["id003"].signinService).toBe("google");
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
    it('evweek & this week', async () => {
        Date.now = jest.fn().mockReturnValue(1585710000000); // 2020/04/01 3:00:00
        const response = adjustData([{ type: 'other',trash_val:"萌えるゴミ",schedules: [{ type: 'evweek', value: {weekday:'0',start: 'thisweek' }}]}],540);
        expect(response[0].schedules[0].value.start).toBe("2020-3-29");
    });
    it('evweek & next week', async () => {
        Date.now = jest.fn().mockReturnValue(1585710000000); // 2020/04/01 3:00:00
        const response = adjustData([{ type: 'other',trash_val:"萌えるゴミ",schedules: [{ type: 'evweek', value: {weekday:'0',start: 'nextweek' }}]}],540);
        expect(response[0].schedules[0].value.start).toBe("2020-4-5");
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