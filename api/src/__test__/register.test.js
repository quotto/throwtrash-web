const data001 = [
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
    put(params) {
        return {
            promise: async () => {
                if(params.Item.platform === "error") {
                    throw new Error("DB Register Error");
                }
                return true;
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
const common = require("trash-common");
const mockId = "1234567891";
jest.spyOn(common, "generateUUID").mockImplementation((separator)=>mockId);
const register = require("../register.js");

describe("register.js",()=>{
    it("Success",async()=>{
        const mockDate = new Date("2020-03-18 22:21:15.151Z");
        const spy = jest.spyOn(global, "Date").mockImplementation(()=>mockDate);
        try {
            const result = await register({description:JSON.stringify(data001),platform: "android"})
            const body = JSON.parse(result.body);
            expect(result.statusCode).toBe(200);
            expect(body.id).toBe(mockId);
        } finally {
            spy.mockRestore();
        }
    });
    it("Invalid Data",async()=>{
        const result = await register({description: JSON.stringify([]),
        platform: "android"});
        expect(result.statusCode).toBe(400);
    });
    it("DB Register Error",async()=>{
        const result = await register({ description: JSON.stringify(data001), platform: "error" });
        expect(result.statusCode).toBe(400);
    });
})