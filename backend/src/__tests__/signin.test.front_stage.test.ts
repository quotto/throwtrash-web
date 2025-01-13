process.env.FRONT_END_STAGE = "001"
process.env.FRONT_END_HOST = "accountlink.mythrowaway.net"
jest.setTimeout(100000);
import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();

import db from "../dbadapter";

import { SessionItem } from "../interface";

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
    it('amazon account linkでは環境変数FRONT_END_STAGEが設定されている場合はそのステージをリダイレクト先URLに利用する', async (): Promise<void> => {
        // パラメータはqueryStringParameters,ドメイン名,APIステージ
        const response = await signin({ access_token: 'token-001', service: 'amazon' }, { id: 'session-id001', expire: 999998}, 'backend.mythrowaway.net', 'dev');
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).toBe('https://accountlink.mythrowaway.net/001/index.html')
        expect(response.headers!['Cache-Control']).toBe('no-store');
    });
});