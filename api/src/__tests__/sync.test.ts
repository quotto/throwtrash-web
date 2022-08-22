/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
jest.mock("../dbadapter")
import dbadapter from "../dbadapter";
const logger = common.getLogger();
logger.setLevel_DEBUG();
import sync from "../sync";

describe("sync",()=>{
    it("正常終了",async()=>{
        const user_id = "id001";
        const trashScheduleData = {
            id: user_id,
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
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{
            return trashScheduleData;
        });

        const result = await sync({ user_id: user_id }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe(trashScheduleData.id);
        expect(body.platform).toBe(trashScheduleData.platform);
        expect(body.description).toBe(trashScheduleData.description);
        expect(body.timestamp).toBe(trashScheduleData.timestamp);
        expect(mockedGetTrashSchedule).toBeCalledWith(user_id);
    });
    it("パラメーにuser_idが無い場合はユーザーエラー",async()=>{
        const result = await sync({}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("ユーザーIDでスケジュールが取得うできない場合はユーザーエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{return null});
        const result = await sync({user_id: "id003"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
})