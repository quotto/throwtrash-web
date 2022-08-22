/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common"
const logger = common.getLogger();
logger.setLevel_DEBUG();

const mockData001 = [
    {
        id: "1234567",
        type: "burn",
        trash_val: "",
        schedules: [
            {
                type: "weekday",
                value: "0"
            },{
                type: "biweek",
                value: "1-1"
            }
        ]
    },{
        id: "8901234",
        type: "other",
        trash_val: "生ゴミ",
        schedules: [
            {
                type: "evweek",
                value: {
                    weekday: "2",
                    start: "2020-03-10"
                }
            }
        ]
    }
];

class mockClass {
    constructor(config: any) { }
    get(params: any) {
        return {
            promise: async () => {
                if(params.Key.code === "code001") {
                    return { Item: { code: params.Key.code, user_id: "id001" } };
                } else if(params.Key.code === "code002") {
                    return {}
                } else if(params.Key.code === "code003") {
                    throw new Error("DB Get Error");
                }
            }
        }
    }
    delete(params: any) {
        return {
            promise: async()=>{return {}}
        }
    }
}
jest.mock("aws-sdk", () => (
    {
        DynamoDB: {
            DocumentClient: mockClass
        }
    }
));

jest.mock("../sync", () => (
    async (params: any) => {
        if (params.user_id === "id001") {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    id: params.user_id,
                    description: JSON.stringify(mockData001),
                    timestamp: 9999999,
                    platform: "android"
                })
            }
        }
        return {};
    }
));
import activate from "../activate";

describe("activate_test",()=>{
    it("正常にゴミ捨てスケジュールが取得されるパターン",async()=>{
        const result = await activate({ code: "code001" }) as APIGatewayProxyStructuredResultV2;
        console.log(result.body);
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body!);
        expect(body.id).toBe("id001");
        expect(body.description).toBe(JSON.stringify(mockData001));
        expect(body.timestamp).toBe(9999999);
        expect(body.platform).toBe("android");
    });
    it("指定したアアクティベーショコードがDB上に見つからない場合",async()=>{
        const result = await activate({code: "code002"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("DB処理が失敗する場合",async()=>{
        const result = await activate({code: "code003"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
})