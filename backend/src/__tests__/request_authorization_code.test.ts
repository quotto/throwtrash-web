import { APIGatewayProxyStructuredResultV2} from "aws-lambda";

import * as firebase_app from "firebase-admin/app";
import * as firebase_firestore from "firebase-admin/firestore";
jest.mock("firebase-admin/app");
jest.mock("firebase-admin/firestore");
jest.mocked(firebase_app.initializeApp).mockImplementation((options:any)=>{return {} as any});
jest.mocked(firebase_firestore.getFirestore).mockImplementation((options:any)=>{return {} as any});
jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import request_authorization_code from "../request_authorization_code";

describe("正常系",()=>{
    it("正常にコードが発行される", async () => {
        const mockedPuthAuthorizationCode = jest.mocked(dbadapter.putAuthorizationCode).mockImplementation(async(user_id: string, client_id: string, redirect_uri: string, expires_in: number)=>{
            return {
                code: "12345",
                user_id: user_id,
                client_id: client_id,
                redirect_uri: redirect_uri,
                expires_in: 11111
            }
        });
        const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({ user_id: "id001", redirect_uri: "https://dummy.client.net", client_id: "dummy_client_id" });
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body!).code).toBe("12345");
        expect(mockedPuthAuthorizationCode).toBeCalledWith("id001","dummy_client_id","https://dummy.client.net",600);
    });
});

describe("異異系",()=>{
    it("パラメーターにuser_idが無い場合ユーザエラー",async()=>{
        const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({ redirect_uri: "https://dummy.client.net", client_id: "dummy_client_id" });
        expect(result.statusCode).toBe(400);
    });
    it("パラメーターにclient_idが無い場合ユーザエラー",async()=>{
        const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({ user_id: "id001",redirect_uri: "https://dummy.client.net"});
        expect(result.statusCode).toBe(400);
    });
    it("パラメーターにresirect_idが無い場合ユーザエラー",async()=>{
        const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({ user_id: "id001",client_id: "dummy_client_id"});
        expect(result.statusCode).toBe(400);
    });
    it("DB処理で異常があった場合サーバーエラー",async()=>{
        jest.mocked(dbadapter.putAuthorizationCode).mockImplementation(async(user_id: string, client_id: string, redirect_uri: string, expires_in: number)=>{
            throw new Error("Unxpected Error");
        });
        const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({ user_id: "id001",client_id: "dummy_client_id"});
        expect(result.statusCode).toBe(400);
    });
})