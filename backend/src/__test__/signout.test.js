/* eslint-disable no-unused-vars */
const logger = require("trash-common").getLogger();
logger.LEVEL = logger.DEBUG;

const property = require("../property");
const mockResult = {}
jest.mock("../dbadapter");
const db = require("../dbadapter");
db.saveSession.mockImplementation(async(_session)=>{
    mockResult[_session.id] = _session;
    return true;
});
describe('signout', () => {
    const signout = require("../signout");
    it('通常のサインアウト', async () => {
        // パラメータはセッション情報
        const response = await signout({ id: 'sessionId', userInfo: { name: 'testUser', signinId: 'signin-id', signinService: 'amazon' , preset: []} });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('signout');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);

        // 保存したセッション
        const session = mockResult["sessionId"];
        expect(session.userInfo).toBeUndefined();
    });
    it('サインインしていない', async () => {
        // サインインしていない場合にはsessionにuserInfoが無い
        const response = await signout({ id: 'sessionId' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
    });
})