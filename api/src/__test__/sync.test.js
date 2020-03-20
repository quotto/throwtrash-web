const mockData001 = {
    id: "id001",
    description: JSON.stringify([
        {
            id: "1234567",
            type: "burn",
            trash_val: "",
            schedules: [
                {
                    type: "weekday",
                    value: "0"
                }, {
                    type: "biweek",
                    value: "1-1"
                }
            ]
        }, {
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
    ]),
    platform: "android",
    timestamp: "99999999"
};

class mockClass {
    constructor(config) { }
    get(params) {
        return {
            promise: async () => {
                if(params.Key.id === "id001") {
                    return { 
                        Item: mockData001
                    };
                } else if(params.Key.id === "id002") {
                    return {}
                } else if(params.Key.id === "id003") {
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
const sync = require("../sync.js");

describe("sync.js",()=>{
    it("Success",async()=>{
            const result = await sync({id: mockData001.id})
            const body = JSON.parse(result.body);
            expect(result.statusCode).toBe(200);
            expect(body.id).toBe(mockData001.id);
            expect(body.platform).toBe(mockData001.platform);
            expect(body.description).toBe(mockData001.description);
            expect(body.timestamp).toBe(mockData001.timestamp);
    });
    it("Id Not Found",async()=>{
        const result = await sync({id: "id002"});
        expect(result.statusCode).toBe(400);
    });
    it("DB Get Error",async()=>{
        const result = await sync({id: "id003"});
        expect(result.statusCode).toBe(400);
    });
})