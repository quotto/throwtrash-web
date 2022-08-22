/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { TrashScheduleItem } from "../interface";
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

import update from "../update";

describe("update",()=>{
    it("正常終了",async()=>{
        const mockedUpdateTrashSchedule = jest.mocked(dbadapter.updateTrashSchdeule).mockImplementation(async(trashScheduleItem: TrashScheduleItem)=>{
           return true;
        });
        const result = await update({ description: JSON.stringify(mockData001), platform: "android", id: "id001" }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.timestamp).toBeGreaterThan(0);
        expect(mockedUpdateTrashSchedule).toBeCalledWith(expect.objectContaining({
            id: "id001",
            platform: "android",
            description: JSON.stringify(mockData001)
        }),expect.any(Number));
    });
    it("登録データが異常の場合はユーザーエラー",async()=>{
        const result = await update({id: "id001", description: JSON.stringify([{type: "burn"}]),
        platform: "android"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("DB登録異常の場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.updateTrashSchdeule).mockImplementation(async(_: TrashScheduleItem)=>false);
        const result = await update({id: "id002", description: JSON.stringify(mockData001), platform: "android"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(500);
    });
})