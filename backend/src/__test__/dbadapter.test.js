/* eslint-disable no-unused-vars */

/**
 * DBアクセス等すべて実装済みで実施する
 */
process.env.DB_REGION = 'us-west-2';
const AWS = require('aws-sdk');
const property = require('../property.js');

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