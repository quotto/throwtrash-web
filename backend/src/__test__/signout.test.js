/* eslint-disable no-unused-vars */
const property = require("../property");
jest.mock("../dbadapter",()=>(
    {
        saveSession: (_session)=>{
            return true;
        }
    }
));
describe('signout', () => {
    const signout = require("../signout");
    it('通常のサインアウト', async () => {
        // パラメータはセッション情報
        const response = await signout({ id: 'sessionId', userInfo: { name: 'testUser', signinId: 'signin-id', signinService: 'amazon' } });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('signout');
        expect(response.headers['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers['Access-Control-Allow-Credentials']).toBe(true);
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