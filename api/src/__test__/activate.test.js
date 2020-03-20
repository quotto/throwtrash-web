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
    constructor(config) { }
    get(params) {
        return {
            promise: async () => {
                if(params.Key.id === "code001") {
                    return { Item: { id: params.Key.id, user_id: "id001" } };
                } else if(params.Key.id === "code002") {
                    return {}
                } else if(params.Key.id === "code003") {
                    throw new Error("DB Get Error");
                }
            }
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

jest.mock("../sync.js", () => (
    async (params) => {
        if (params.id === "id001") {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    id: params.id,
                    description: JSON.stringify(mockData001),
                    timestamp: 9999999,
                    platform: "android"
                })
            }
        }
        return {};
    }
));
const activate = require("../activate.js");

describe("activate_test",()=>{
    it("Success",async()=>{
        const result = await activate({ code: "code001" });
        console.log(result.body);
        const body = JSON.parse(result.body);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.description).toBe(JSON.stringify(mockData001));
        expect(body.timestamp).toBe(9999999);
        expect(body.platform).toBe("android");
    });
    it("Activation Code Not Found",async()=>{
        const result = await activate({code: "code002"});
        expect(result.statusCode).toBe(400);
    });
    it("DynamoDB Get Error",async()=>{
        const result = await activate({code: "code003"});
        expect(result.statusCode).toBe(400);
    });
})