import db from "../dbadapter";
import * as common from "trash-common";
import { SessionItem } from "../interface";
import google_signin from "../google_signin";

jest.mock("../dbadapter");
jest.spyOn(common, "generateRandomCode").mockImplementation((length: any)=>{
    let code = "";
    for(let i=0; i<length; i++) {
        code += "a"
    }
    return code;
});

describe("google_signin", () => {
    const mockResult: {[key:string]: SessionItem} = {};
    jest.mocked(db.saveSession).mockImplementation(async (session) => {
        mockResult[session.id] = session;
        return true;
     });
    it("正常リクエスト", async () => {
        process.env.GOOGLE_CLIENT_ID = "clientId";
        //パラメータはセッション情報とドメインとリクエストパス中のstage
        const response = await google_signin({ id: "hogehoge",expire: 99999999 }, "backend.mythrowaway.net", "v2");
        expect(response.statusCode).toBe(301);
        expect(response.headers).not.toBeUndefined();
        expect(response.headers!.Location).not.toBeUndefined();
        expect(response.headers!.Location!).toBe("https://accounts.google.com/o/oauth2/v2/auth?client_id=clientId&response_type=code&scope=openid profile&redirect_uri=https://backend.mythrowaway.net/v2/signin?service=google&state=aaaaaaaaaaaaaaaaaaaa&login_hint=mythrowaway.net@gmail.com&nonce=aaaaaaaaaaaaaaaa");
        expect(response.headers!["Cache-Control"]).toBe("no-store");

        // 保尊したセッション
        const session = mockResult["hogehoge"];
        expect(session.googleState).toBe("aaaaaaaaaaaaaaaaaaaa");
    });
});