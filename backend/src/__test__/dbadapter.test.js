/* eslint-disable no-unused-vars */

/**
 * DBアクセス等すべて実装済みで実施する
 */
process.env.DB_REGION = "us-west-2";
const AWS = require("aws-sdk");
const property = require("../property.js");
const crypto = require("crypto");

const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

// はるか未来の日付
const DEFAULT_EXPIRE = 4133862000000;

const db = require("../dbadapter");
describe('getDataBySigninId',()=>{
    const testdata =  {
        id: 'test-001',
        description: JSON.stringify([
            { type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }
        ]),
        signinId: '1111-1111-1111'
    };
    beforeAll((done)=>{
        documentClient.put({
            TableName: property.SCHEDULE_TABLE,
            Item: testdata
        }).promise().then(()=>done());
    })
    it('IDあり',async()=>{
        const result = await db.getDataBySigninId('1111-1111-1111');
        expect(JSON.stringify(result)).toBe(JSON.stringify(testdata));
    });
    it('IDなし',async()=>{
        const result = await db.getDataBySigninId('xxxx-xxxx-xxxx');
        expect(JSON.stringify(result)).toBe("{}");
    });
    afterAll((done)=>{
        documentClient.delete({
            TableName: property.SCHEDULE_TABLE,
            Key: {
                id: 'test-001'
            }
        }).promise().then(()=>{
            done();
        });
    });
})

describe('saveSession',()=>{
    beforeAll((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: property.SESSION_TABLE,
            Item: {
                id: 'session002',
                expire: 3600,
                userInfo: {
                    signinId: 'amazon001',
                    signinService: 'amazon',
                    preset: [{type: 'burn', schedules:[{type: 'weekday',value: '0'}]}],
                    id: 'test002'
                }
            }
        }).promise().then(()=>done());
    });
    it('セッションテーブルに存在しないデータ', async()=>{
        const session_data = {id: 'session001'};
        const result = await db.saveSession(session_data);
        expect(result);

        documentClient.get({
            TableName: property.SESSION_TABLE,
            Key: {
                id: 'session001'
            }
        }).promise().then((data)=>{
            expect(data.Item.id).toBe("session001");
            expect(data.Item.expire).toBeDefined();
        });
    });
    it('セッションテーブルに存在するデータ', async()=>{
        const overwireUserInfo = {
            signinId: 'google001',
            signinService: 'google',
            preset: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }],
            id: 'test002'
        }
        const session_data = {id: 'session002', expire: 3600,userInfo: overwireUserInfo};
        const result = await db.saveSession(session_data);
        expect(result);
        await documentClient.get({
            TableName: property.SESSION_TABLE,
            Key: {
                id: 'session002'
            }
        }).promise().then((data)=>{
            expect(data.Item.id).toBe('session002');
            expect(data.Item.userInfo).toMatchObject(overwireUserInfo);
            expect(data.Item.expire).toBeDefined();
        });
    });
    afterAll((done)=>{
        documentClient.batchWrite({
            RequestItems:{
                "throwtrash-backend-session": [
                    {
                        DeleteRequest:{
                            Key:{id: "session001"}
                        }
                    },
                    {
                        DeleteRequest:{
                            Key:{id: "session002"}
                        }
                    }
                ]
            }
        }).promise().then(()=>done());
    });

});

describe('deleteSession',()=>{
    beforeAll((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: property.SESSION_TABLE,
            Item:{
                id: 'test002',
                expire: 3600
            }
        }).promise().then(()=>done())
    });
    it('存在しないセッションIDを削除',async()=>{
        // パラメータはセッションID
        const result = await db.deleteSession('test001');
        // 削除は対象のIDが無くてもtrue
        expect(result);
    });
    it('存在するセッション',async()=>{
        // パラメータはセッションID
        const result = await db.deleteSession('test002');
        // 削除は対象のIDが無くてもtrue
        expect(result);

        await documentClient.get({
            TableName: property.SESSION_TABLE,
            Key:{
                id: 'test002'
            }
        // eslint-disable-next-line no-unused-vars
        }).promise().then(()=>expect(false)).catch(err=>{expect(true)});
    });
    afterAll((done)=>{
        documentClient.delete({
            TableName: property.SESSION_TABLE,
            Key:{
                id: 'test002'
            }
        }).promise().then(()=>done()).catch(()=>done());
    })
});

describe('publishId',()=>{
    const duplicate_id = 'xxxxxxxx-xxxxxxxx-xxxxxxx-xxxxxxxx';
    beforeAll((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: property.SCHEDULE_TABLE,
            Item: {
                id: duplicate_id
            }
        }).promise().then(()=>done());
    });
    it('正常パターン',async()=>{
       const id = await db.publishId();
       expect(id.length).toBe(36);
    });
    afterAll((done)=>{
        documentClient.delete({
            TableName: property.SCHEDULE_TABLE,
            Key: {
                id: duplicate_id
            }
        }).promise().then(()=>done());
    });
});

describe('getSession', ()=>{
    const session_id_001 = 'getSession_id_001';
    const session_id_002 = 'getSession_id_002';
    const session_id_003 = 'getSession_id_003';
    beforeAll((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.batchWrite({
            RequestItems:{
                "throwtrash-backend-session": [
                    {
                        PutRequest:{
                            Item:{id: session_id_001,expire: DEFAULT_EXPIRE}
                        }
                    },
                    {
                        PutRequest:{
                            Item:{id: session_id_002,expire:1175796317300}
                        }
                    }
                ]
            }
        }).promise().then(()=>done());
    });
    it('有効期限内',async ()=>{
        //有効期限内ならセッションを返す
        const session = await db.getSession(session_id_001);
        expect(JSON.stringify(session)).toBe(JSON.stringify({id: session_id_001,expire: DEFAULT_EXPIRE}));
    });
    it('sessionIdナシ',async()=>{
        //セッションIDが無ければnull
        const session = await db.getSession(session_id_003);
        expect(session).toBeUndefined();
    });
    afterAll((done)=>{
        documentClient.batchWrite({
            RequestItems:{
                "throwtrash-backend-session": [
                    {
                        DeleteRequest:{
                            Key:{id: session_id_001}
                        }
                    }
                ]
            }
        }).promise().then(()=>done());
    });
});

describe('publishSession',()=>{
    beforeAll(()=>{
        process.env.DB_REGION = 'us-west-2';
    });
    it('publish new session id',async ()=>{
        const session = await db.publishSession();
        expect(session.id.length).toBe(20);
        await documentClient.get({
            TableName: property.SESSION_TABLE,
            Key:{id: session.id}
        }).promise().then(async(data)=>{
            expect(data.Item.id).toBe(session.id);
            await documentClient.delete({
                TableName: property.SESSION_TABLE,
                Key:{id: session.id}
            }).promise();
        });
    });
});

describe("putAuthorizationCode",()=>{
    it("正常登録",async()=>{
        const result = await db.putAuthorizationCode("id0001","alexa-skill","https://example.com/skill");

        console.log(JSON.stringify(result));
        await documentClient.get({
            TableName: property.AUTHORIZE_TABLE,
            Key: {
                code: result.code
            }
        }).promise().then((data)=>{
            expect(data.Item.code).toBe(result.code);
            expect(data.Item.client_id).toBe("alexa-skill");
            expect(data.Item.redirect_uri).toBe("https://example.com/skill");
            expect(data.Item.user_id).toBe("id0001");
            // expires_inは正確な時刻判定は難しいので現時刻の+-10秒以内であることとする。
            const expire = Date.now() + (5 * 60 * 1000);
            expect(data.Item.expires_in).toBeLessThan(Math.ceil(expire/1000)+10);
            expect(data.Item.expires_in).toBeGreaterThan(Math.ceil(expire/1000)-10);
        });

        await documentClient.delete({
            TableName: property.AUTHORIZE_TABLE,
            Key: {
                code: result.code
            }
        }).promise();
    });
});

describe("getAuthorizationCode",()=>{
    beforeAll(async()=>{
        await documentClient.put({
            TableName: property.AUTHORIZE_TABLE,
            Item: {
                code: "1234567",
                client_id: "alexa-skill",
                user_id: "id001",
                redirect_uri: "https://example.com/skill",
                expires_in: Math.ceil(Date.now()/1000)+5*60
            }
        }).promise();
    });
    it("存在するデータ",async()=>{
        const result = await db.getAuthorizationCode("1234567");
        console.log(JSON.stringify(result));
        expect(result.code).toBe("1234567");
        expect(result.client_id).toBe("alexa-skill");
        expect(result.user_id).toBe("id001");
        expect(result.redirect_uri).toBe("https://example.com/skill");
    });
    it("存在しないデータ",async()=>{
        const result = await db.getAuthorizationCode("9999999");
        expect(result).toBeUndefined();
    });
    afterAll(async()=>{
        await documentClient.delete({
            TableName: property.AUTHORIZE_TABLE,
            Key: {
                code: "1234567"
            }
        }).promise();
    });
});

describe("putAccessToken",()=>{
    it("正常登録",async()=>{
        const result = await db.putAccessToken("id0001","alexa-skill");
        console.log(JSON.stringify(result));
        expect(result.access_token).toBeDefined();

        const hashKey = crypto.createHash("sha512").update(result.access_token).digest("hex");
        await documentClient.get({
            TableName: property.TOKEN_TABLE,
            Key: {
                access_token: hashKey
            }
        }).promise().then((data)=>{
            expect(data.Item.user_id).toBe("id0001");
            expect(data.Item.client_id).toBe("alexa-skill");
            // expires_inは正確な時刻判定は難しいので現時刻の+-10秒以内であることとする。
            const expire = Date.now() + (7 * 24 * 60 * 60 * 1000); 
            expect(data.Item.expires_in).toBeLessThan(Math.ceil(expire/1000)+10);
            expect(data.Item.expires_in).toBeGreaterThan(Math.ceil(expire/1000)-10);
        });

        // テスト後はデータ削除
        await documentClient.delete({
            TableName: property.TOKEN_TABLE,
            Key: {
                access_token: hashKey
            }
        }).promise();
    });
});

describe("putRefreshToken",()=>{
    it("正常登録",async()=>{
        const result = await db.putRefreshToken("id0001","alexa-skill");
        console.log(JSON.stringify(result));
        expect(result.refresh_token).toBeDefined();

        const hashKey = crypto.createHash("sha512").update(result.refresh_token).digest("hex");
        await documentClient.get({
            TableName: property.REFRESH_TABLE,
            Key: {
                refresh_token: hashKey 
            }
        }).promise().then((data)=>{
            expect(data.Item.refresh_token).toBe(hashKey);
            expect(data.Item.user_id).toBe("id0001");
            expect(data.Item.client_id).toBe("alexa-skill");
            // expires_inは正確な時刻判定は難しいので現時刻の+-10秒以内であることとする。
            const expire = Date.now() + (30 * 24 * 60 * 60 * 1000);
            expect(data.Item.expires_in).toBeLessThan(Math.ceil(expire/1000)+10);
            expect(data.Item.expires_in).toBeGreaterThan(Math.ceil(expire/1000)-10);
        });

        // テスト後はデータ削除
       await documentClient.delete({
            TableName: property.REFRESH_TABLE,
            Key: {
                refresh_token: hashKey
            }
        }).promise();
    });
});