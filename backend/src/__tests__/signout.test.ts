import {getLogger} from "trash-common";
const logger = getLogger();
logger.setLevel_DEBUG();

import signout from "../signout";
import db from "../dbadapter";
import property from "../property";

import { mocked } from "ts-jest/utils";
import { SessionItem } from "../interface";
const mockResult: {[key:string]:SessionItem} = {}

jest.mock("../dbadapter");
mocked(db.saveSession).mockImplementation(async(_session)=>{
    mockResult[_session.id] = _session;
    return true;
});
describe('signout', () => {
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