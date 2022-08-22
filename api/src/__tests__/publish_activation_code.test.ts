/* eslint-disable no-unused-vars */
import * as common  from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();

import publish_activation_code from "../publish_activation_code";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { ActivationCodeItem, CodeItem } from "../interface";

describe("publish_activation_code",()=>{
    it("正常終了",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{
            return {
                id: user_id,
                platform: "android",
                description: JSON.stringify({})
            };
        });
        const mockedPutActivationCode = jest.mocked(dbadapter.putActivationCode).mockImplementation(async(activationCodeItem: ActivationCodeItem)=>{return true});

        const result = await publish_activation_code({ user_id: "id001" }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.code.length).toBe(10);

        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(mockedPutActivationCode).toBeCalledWith(expect.objectContaining({
            code: expect.any(String),
            user_id: "id001",
            TTL: expect.any(Number)
        }));
    });
    it("user_idが無い場合はユーザエラー",async()=>{
        const result = await publish_activation_code({ }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("TrashScheduleItemが見つからない場合はユーザエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{return null});
        jest.mocked(dbadapter.putActivationCode).mockImplementation(async(activationCodeItem: ActivationCodeItem)=>{return true});
        const result = await publish_activation_code({ user_id: "id003" }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("ActivationCodeの登録を5回以上失敗したらサーバーエラー", async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{
            return {
                id: user_id,
                platform: "android",
                description: JSON.stringify({})
            };
        });
        jest.mocked(dbadapter.putActivationCode).mockImplementation(async(activationCodeItem: ActivationCodeItem)=>{return false});
        const result = await publish_activation_code({ user_id: "id004" }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(500);
    });
})