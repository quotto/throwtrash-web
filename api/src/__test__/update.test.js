/* eslint-disable no-unused-vars */
const log4js = require("log4js");
log4js.configure(require("./log4js.test.config.json"));
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
    put(params) {
        return {
            promise: async () => {
                if(params.Item.id === "id001") {
                    return true
                } else if(params.Item.id === "id002") {
                    throw new Error("DB Get Error");
                }
                return false;
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
const update = require("../update.js");

describe("update.js",()=>{
    it("Success",async()=>{
        const mockDate = new Date("2020-03-18 22:21:15.151Z");
        const spy = jest.spyOn(global, "Date").mockImplementation(()=>mockDate);
        try {
            const result = await update({description:JSON.stringify(mockData001),platform: "android",id: "id001"})
            const body = JSON.parse(result.body);
            expect(result.statusCode).toBe(200);
            expect(body.timestamp).toBe(mockDate.getTime());
        } finally {
            spy.mockRestore();
        }
    });
    it("Invalid Data",async()=>{
        const result = await update({description: JSON.stringify([{type: "burn"}]),
        platform: "android"});
        expect(result.statusCode).toBe(400);
    });
    it("DB Update Error",async()=>{
        const result = await update({id: "id002"});
        expect(result.statusCode).toBe(400);
    });
})