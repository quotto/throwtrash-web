const property = require("../property.js");
class mockClass {
    constructor(config) { }
    get(params) {
            return {
                promise: async () => {
                    if (params.TableName === property.TRASH_SCHEDULE_TABLE_NAME) {
                        if (params.Key.id === "id001") {
                            return {
                                Item: { id: "id001" }
                            };
                        } else if (params.Key.id === "id002") {
                            return {
                                Item: { id: "id002" }
                            };
                        } else if (params.Key.id === "id003") {
                            return {};
                        } else if (params.Key.id === "id004") {
                            throw new Error("ID Get Error");
                        }
                    } else if(params.TableName === property.ACTIVATE_TABLE_NAME) {
                        return {}
                    }

                }
            }
    }
    put(params) {
        return {
            promise: async()=>{
                if(params.Item.user_id === "id005") {
                    throw new Error("DB Put Error");
                }
                return true;
            }
        }
    }
}

const aws_sdk_mock = jest.mock("aws-sdk", () => (
    {
        DynamoDB: {
            DocumentClient: mockClass
        }
    }
));
const publish_activation_code = require("../publish_activation_code.js");

describe("publish_activation_code",()=>{
    it("Success",async()=>{
        const result = await publish_activation_code({ id: "id001" });
        const body = JSON.parse(result.body);
        expect(result.statusCode).toBe(200);
        expect(body.code.length).toBe(10);
    });
    it("ID Not Found",async()=>{
        const result = await publish_activation_code({ id: "id003" });
        expect(result.statusCode).toBe(400);
    });
    it("ID Get Error", async()=>{
        const result = await publish_activation_code({ id: "id004" });
        expect(result.statusCode).toBe(400);
    });
    it("Activation Code Put Error", async()=>{
        const result = await publish_activation_code({id: "id005"});
        expect(result.statusCode).toBe(400);
    });
})