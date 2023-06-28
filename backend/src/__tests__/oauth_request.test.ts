import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();
import oauth_request from "../oauth_request";
import db from "../dbadapter";
import error_def from "../error_def";

import { SessionItem } from "../interface";

const mockResult: {[key:string]: SessionItem} = {};
jest.mock("../dbadapter");
jest.mocked(db.saveSession).mockImplementation(async(session)=>{
    mockResult[session.id] = session;
    if (session.id === "sessionid-001" || session.id === "sessionid-002") {
        return true;
    }
    return false;
});
describe("oauth_request", () => {
    it("セッションID新規発行されること,フロントエンドステージの環境変数がない場合はAPI上のパスをステージに使用すること", async () => {
        // パラメータはqueryStringParameters,セッション情報,セッション新規発行フラグ,API Gatewayのstage
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon"
        }, { id: "sessionid-001", expire: 99999999 },
            true,
            "v5"
        );
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe("https://accountlink.mythrowaway.net/v5/index.html");
        expect(headers!["Set-Cookie"]).toBe("throwaway-session=sessionid-001;max-age=3600;");

        // 保存したセッション
        const session = mockResult["sessionid-001"];
        expect(session.state).toBe("123456");
        expect(session.client_id).toBe("alexa-skill");
        expect(session.redirect_uri).toBe("https://xxxx.com");
        expect(session.platform).toBe("amazon");
        expect(session.expire).toBe(99999999);
    });
    it("有効なセッションIDを既に利用している場合はセッションIDを継続すること", async () => {
        // 環境変数を設定する
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon"
        },
            { id: "sessionid-002", expire: 99999999 },
            false,
            "v5");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe("https://accountlink.mythrowaway.net/v5/index.html");
        expect(headers!["Set-Cookie"]).toBe(undefined);

        // 保存したセッション
        const session = mockResult["sessionid-002"];
        expect(session.state).toBe("123456");
        expect(session.client_id).toBe("alexa-skill");
        expect(session.redirect_uri).toBe("https://xxxx.com");
        expect(session.platform).toBe("amazon");
        expect(session.expire).toBe(99999999);
    });
    it("セッションの保存に失敗した", async () => {
        const response = await oauth_request({
            state: "123456",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon"
        },
            { id: "sessionid-003", expire: 99999999 },
            false,
            "v5");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe(error_def.ServerError.headers.Location);
    });
    it("パラメータエラー state無し", async () => {
        const response = await oauth_request({
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
        }, {id: "session001",expire: 999999}, true, "dev");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー client_id無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            redirect_uri: "https://xxxx.com",
            platform: "amazon",
        }, {id: "session001", expire:999999}, true, "v5");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー redirect_uri無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            client_id: "alexa-skill",
            platform: "amazon"
        }, {id: "session001", expire:999999}, false, "v5");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe(error_def.UserError.headers.Location);
    });
    it("パラメータエラー platform無し", async () => {
        const response = await oauth_request({
            state: "xxxxxx",
            client_id: "alexa-skill",
            redirect_uri: "https://xxxx.com",
        }, {id: "session001",expire: 9999999}, false, "v5");
        expect(response.statusCode).toBe(301);
        const headers = response.headers;
        expect(headers).not.toBeUndefined();
        expect(headers!.Location).toBe(error_def.UserError.headers.Location);
    });
});