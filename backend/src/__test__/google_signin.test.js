describe("google_signin", () => {
    const mockResult = [];
    jest.mock("../dbadapter");
    const db = require("../dbadapter");
    db.saveSession.mockImplementation(async (session) => { 
        mockResult[session.id] = session;
        return true;
     });
    jest.mock("trash-common",()=>({
        generateRandomCode: (length)=>{
            let code = "";
            for(let i=0; i<length; i++) {
                code += "a"
            }
            return code;
        }
    }))
    const google_signin = require("../google_signin");
    it("正常リクエスト", async () => {
        process.env.GOOGLE_CLIENT_ID = "clientId";
        //パラメータはセッション情報とドメインとリクエストパス中のstage
        const response = await google_signin({ id: "hogehoge" }, "backend.mythrowaway.net", "v2");
        expect(response.statusCode).toBe(301);
        expect(response.headers.Location).toBe("https://accounts.google.com/o/oauth2/v2/auth?client_id=clientId&response_type=code&scope=openid profile&redirect_uri=https://backend.mythrowaway.net/v2/signin?service=google&state=aaaaaaaaaaaaaaaaaaaa&login_hint=mythrowaway.net@gmail.com&nonce=aaaaaaaaaaaaaaaa");
        expect(response.headers["Cache-Control"]).toBe("no-store");

        // 保尊したセッション
        const session = mockResult["hogehoge"];
        expect(session.googleState).toBe("aaaaaaaaaaaaaaaaaaaa");
    });
});