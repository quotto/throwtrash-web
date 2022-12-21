import { mocked } from "ts-jest/utils";
import { idText, isExportDeclaration } from "typescript";
jest.mock("../dbadapter");
import db from "../dbadapter"
import error_def from "../error_def";
import { SessionItem } from "../interface";
import property from "../property";
const mockSaveSessionResult: any = {};
mocked(db.saveSession).mockImplementation(async(session: SessionItem)=> {
 mockSaveSessionResult[session.id] = session;
 return true;
});

import start_link from "../start_link";
describe("start_link",()=>{
    describe("正常系",()=>{
        it("パラメータにplatformの指定がない場合（LoginWithAmazonによるリンク開始）",async()=> {
           const result = await start_link({id: "user001"},{id: "session001"},"dev");
           const resultSession = mockSaveSessionResult["session001"];
           expect(resultSession.user_id).toBe("user001");
           expect(resultSession.state).toBeDefined();
           expect(resultSession.redirect_uri).toBe("https://backend.mythrowaway.net/dev/enable_skill");
            expect(result.statusCode).toBe(200);
            expect(result.headers?.["Set-Cookie"]).toBe(`throwaway-session=session001;max-age=${property.SESSION_MAX_AGE};`);
            expect(result.headers?.["Cache-Control"]).toBe("no-store");
            expect(JSON.parse(result.body!).url.indexOf("https://www.amazon.com")).toBe(0);
        });
        it("パラメータのplatformがandroidの場合",async()=> {
           const result = await start_link({id: "user002", platform: "android"},{id: "session002"},"dev");
           const resultSession = mockSaveSessionResult["session002"];
           expect(resultSession.user_id).toBe("user002");
           expect(resultSession.state).toBeDefined();
           expect(resultSession.redirect_uri).toBe("https://mobileapp.mythrowaway.net/accountlink");
            expect(result.statusCode).toBe(200);
            expect(result.headers?.["Set-Cookie"]).toBe(`throwaway-session=session002;max-age=${property.SESSION_MAX_AGE};`);
            expect(result.headers?.["Cache-Control"]).toBe("no-store");
            expect(JSON.parse(result.body!).url.indexOf("https://alexa.amazon.com")).toBe(0);
        });
    });
    describe("異常系",()=>{
        it("パラメータにidの指定がない",async()=>{
           const result = await start_link({platform: "android"},{id: "session002"},"dev");
           expect(result.statusCode).toBe(301);
           expect(result.headers?.Location).toBe(error_def.UserError.headers.Location);
        })
    })
})