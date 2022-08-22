import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common"
const logger = common.getLogger();
logger.setLevel_DEBUG();

jest.mock("request-promise",()=>(async(option: any)=>{
    if(option.uri === "https://api.amazon.com/auth/o2/token") {
        return {
            access_token: "amazon-accesstoken001"
        }
    } else if(option.uri === "https://api.amazonalexa.com/v1/alexaApiEndpoint") {
        return {
            endpoints:[
                "alexa.endpoint.com"
            ]
        }
    } else if(option.uri === "https://alexa.endpoint.com/v1/users/~current/skills/test-skill-id-dev/enablement") {
        if(option.body.stage === "development" && option.body.accountLinkRequest.redirectUri === "https://backend.mythrowaway.net/dev/enable_skill" && option.body.accountLinkRequest.authCode.length > 0 && option.body.accountLinkRequest.type === "AUTH_CODE" && option.headers.Authorization === "Bearer amazon-accesstoken001") {
            return {
                result: "success"
            }
        }
    } else if(option.uri === "https://alexa.endpoint.com/v1/users/~current/skills/test-skill-id-prod/enablement"){
        if((option.body.stage === "live" || option.body.stage === "dev") && option.body.accountLinkRequest.redirectUri === "https://backend.mythrowaway.net/v1/enable_skill" && option.body.accountLinkRequest.authCode.length > 0 && option.body.accountLinkRequest.type === "AUTH_CODE" && option.headers.Authorization === "Bearer amazon-accesstoken001"){
            return {
                result: "success"
            }
        }
    } else if(/^https:\/\/backend\.throwtrash\.net\/dev\/request_authorization_code\?.+$/.exec(option.uri)) {
        return {
            code: "12345"
        };
    }
    console.debug(option);
    throw new Error("rp error");
}));


jest.mock("../dbadapter");
import db from "../dbadapter";
const mockedDeleteAccountLinkItemByToken = jest.mocked(db.deleteAccountLinkItemByToken);

import enable_skill from "../enable_skill";
import error_def from "../error_def";
import { CodeItem } from "../interface";
process.env.RESOURCE_ENDPOINT="https://backend.throwtrash.net/dev"
describe("enable_skill",()=>{
    describe("正常系",()=>{
        it("開発:正常終了,paramsはtoken/state/redirect_uri/codeが正しく指定されている",async()=>{


            const mockedGetAccountLinkItemByToken = jest.mocked(db.getAccountLinkItemByToken);
            mockedGetAccountLinkItemByToken.mockImplementation(async (token: String) => {
                return {
                    token: "token-dev",
                    state: "12345",
                    user_id: "id001",
                    redirect_url: "https://backend.mythrowaway.net/dev/enable_skill",
                    TTL: 123456789
                }
            });

            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-dev";
            const result = await enable_skill({token:"token-dev",state: "12345",redirect_uri: "https://backend.mythrowaway.net/dev/enable_skill",code:"12345"},"dev") as APIGatewayProxyStructuredResultV2;

            expect(result.statusCode).toBe(301);
            expect(result.headers!.Location).toBe("https://accountlink.mythrowaway.net/dev/accountlink-complete.html");

            expect(mockedGetAccountLinkItemByToken).toBeCalledWith("token-dev")

            expect(mockedDeleteAccountLinkItemByToken).toBeCalledWith("token-dev");
        });
        it("本番:正常終了,paramsのtoken/state/redirect_uri/codeが正しく指定されている",async()=>{

            const mockedGetAccountLinkItemByToken = jest.mocked(db.getAccountLinkItemByToken);
            mockedGetAccountLinkItemByToken.mockImplementation(async (token: String) => {
                return {
                    token: "token-prod",
                    state: "12345",
                    user_id: "id001",
                    redirect_url: "https://backend.mythrowaway.net/v1/enable_skill",
                    TTL: 123456789
                }
            });

            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-prod";
            const result = await enable_skill({token: "token-prod",state: "12345", redirect_uri: "https://backend.mythrowaway.net/v1/enable_skill",code:"12345"},"v1") as APIGatewayProxyStructuredResultV2;

            expect(result.statusCode).toBe(301);
            expect(result.headers!.Location).toBe("https://accountlink.mythrowaway.net/v1/accountlink-complete.html");

            expect(mockedGetAccountLinkItemByToken).toBeCalledWith("token-prod")

            expect(mockedDeleteAccountLinkItemByToken).toBeCalledWith("token-prod");
        });
    });
    describe("異常系",()=>{
        it("アカウントリン開始時の情報が見つからない場合はユーザーエラー",async()=>{
            const mockedGetAccountLinkItemByToken = jest.mocked(db.getAccountLinkItemByToken);
            mockedGetAccountLinkItemByToken.mockImplementation(async (token: String) => {
                return null;
            });

            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-prod";
            const result = await enable_skill({token: "token-prod",state: "12345", redirect_uri: "https://backend.mythrowaway.net/v1/enable_skill",code:"12345"},"v1") as APIGatewayProxyStructuredResultV2;

            expect(result.statusCode).toBe(301);
            expect(result.headers!.Location).toBe(error_def.UserError.headers.Location);
        });
        it("authorization codeの取得に失敗した場合はサーバエラー",async()=>{
            process.env.RESOURCE_ENDPOINT="https://dummy.net";
            jest.mocked(db.getAccountLinkItemByToken).mockImplementation(async (token: String) => {
                return {
                    token: "token-prod",
                    state: "12345",
                    user_id: "id001",
                    redirect_url: "https://backend.mythrowaway.net/v1/enable_skill",
                    TTL: 123456789
                };
            });

            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-prod";
            const result = await enable_skill({token: "token-prod",state: "12345", redirect_uri: "https://backend.mythrowaway.net/v1/enable_skill",code:"12345"},"v1") as APIGatewayProxyStructuredResultV2;

            expect(result.statusCode).toBe(301);
            expect(result.headers!.Location).toBe(error_def.ServerError.headers.Location);
        })
        it("params.stateとDBのstateが一致しなければユーザーエラー",async()=>{

            const result = await enable_skill({token: "token-dev", state: "not_match_state", code: "12345", redirect_uri: "https://dummy.com"},  "v1") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(301);
            const headers = result.headers;
            expect(headers!.Location).toBe(error_def.UserError.headers.Location);
        });
        it("params.tokenが無い場合はユーザーエラー",async()=>{
            const result = await enable_skill({state: "12345", code: "12345", redirect_uri: "https://dummy.com"}, "v1") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(301);
            const headers = result.headers;
            expect(headers!.Location).toBe(error_def.UserError.headers.Location);
        });
        it("params.codeが無い場合はユーザーエラー",async()=>{
            const result = await enable_skill({token: "toinx-dev", state: "12345", redirect_uri: "https://dummy.com"}, "v1") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(301);
            const headers = result.headers;
            expect(headers!.Location).toBe(error_def.UserError.headers.Location);
        });
        it("params.redirect_uriがない場合はユーザーエラー",async()=>{
            process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
            process.env.ALEXA_SKILL_ID = "test-skill-id-prod";
            const result = await enable_skill({state: "12345"},"v1") as APIGatewayProxyStructuredResultV2;

            expect(result.statusCode).toBe(301);
            expect(result.headers!.Location).toBe(error_def.UserError.headers.Location);
        });
    });
});