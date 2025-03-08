/* eslint-disable no-unused-vars */

import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
console.log(common);

const mockId = "1234567891";
const mockFirebaseAccountId = "firebase-account-id";

// Mock the entire common module instead of using spyOn
jest.mock("trash-common", () => {
  const originalModule = jest.requireActual("trash-common");
  return {
    ...originalModule,
    generateUUID: jest.fn((separator) => mockId)
  };
});

jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { TrashScheduleItem } from "../interface";
import register from "../register";

describe("register",()=>{
    it("正常終了",async()=>{
        const mockedInsertTrashSchedule = jest.mocked(dbadapter.insertTrashSchedule).mockImplementation(async (_: TrashScheduleItem, timestamp) => { return true });
        const result = await register("{\"platform\": \"android\"}", mockFirebaseAccountId) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.id.length).toBeGreaterThan(0);

        expect(mockedInsertTrashSchedule).toBeCalledWith(expect.objectContaining({
            id: expect.any(String),
            description: JSON.stringify([]),
            platform: "android",
            mobile_signin_id: mockFirebaseAccountId,
        }), expect.any(Number));
    });
    it("platformの指定が無い場合はユーザーエラー",async()=>{
        const result = await register("{}", mockFirebaseAccountId) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("platformが空の場合はユーザーエラー",async()=>{
        const result = await register("{\"platform\": \"\"}", mockFirebaseAccountId) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("JSONのSyntaxエラーの場合はユーザーエラー", async () => {
        const result = await register("platform", mockFirebaseAccountId) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });

    it("DB登録異常の場合はサーバエラー",async()=>{
        jest.mocked(dbadapter.insertTrashSchedule).mockImplementation(async (_: TrashScheduleItem, timestamp) => { return false });
        const result = await register("{\"platform\": \"error\"}", mockFirebaseAccountId) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(500);
    });
});