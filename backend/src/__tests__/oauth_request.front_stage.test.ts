import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();
process.env.FRONT_END_STAGE = "dev";
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
    it("フロントエンドステージの環境変数がある場合はその値を利用すること", async () => {
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
        expect(headers!.Location).toBe("https://accountlink.mythrowaway.net/dev/index.html");
        expect(headers!["Set-Cookie"]).toBe("throwaway-session=sessionid-001;max-age=3600;");

        // 保存したセッション
        const session = mockResult["sessionid-001"];
        expect(session.state).toBe("123456");
        expect(session.client_id).toBe("alexa-skill");
        expect(session.redirect_uri).toBe("https://xxxx.com");
        expect(session.platform).toBe("amazon");
        expect(session.expire).toBe(99999999);
    });
});