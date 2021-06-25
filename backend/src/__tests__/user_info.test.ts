import { getLogger } from "trash-common";
const logger = getLogger();
logger.setLevel_DEBUG();

import property from "../property";
import user_info from '../user_info';

describe('user_info', ()=>{
    it('セッションあり,サインインあり', ()=>{
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}];
        // パラメータはセッション情報
        const response = user_info(
            {
                id: 'sessionid', 
                userInfo: { 
                    name: 'testUser', 
                    signinId: 'signin-id', 
                    signinService: 'amazon',
                    preset: test_data_001
                },
                expire: 999999
            }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({name: 'testUser', preset: test_data_001}));
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers!['Access-Control-Allow-Credentials']).toBe(true);
    });
    it('セッションあり,サインインなし',()=>{
        const response = user_info({id: 'sessionid', expire: 9999999});
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({name: "", preset: null}));
        expect(response.headers!['Access-Control-Allow-Origin']).toBe(property.URL_ACCOUNT_LINK);
        expect(response.headers!['Access-Control-Allow-Credentials']).toBe(true);
    });
})