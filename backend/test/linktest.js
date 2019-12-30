/**
 * DBアクセス等すべて実装済みで実施する
 */
process.env.DB_REGION = 'us-west-2';
const rewire = require('rewire');
const index = rewire('../index.js');
const assert = require('assert');
const AWS = require('aws-sdk');
const firebase_admin = require('firebase-admin');

const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
// firebase_admin.initializeApp({
//     credential: firebase_admin.credential.applicationDefault()
// });
const firestore = firebase_admin.firestore();

const TBL_ThrowTrashSession = 'ThrowTrashSession';
const TBL_TrashSchedule = 'TrashSchedule';

const URL_400 = 'https://accountlink.mythrowaway.net/400.html';
const URL_ACCOUNT_LINK = 'https://accountlink.mythrowaway.net';
// はるか未来の日付
const DEFAULT_EXPIRE = 4133862000000;

class StubModule {
    constructor(mod,object_name){
        this.object_name = object_name;
        this.original = mod.__get__(this.object_name);
        this.mod = mod;
    }

    set(stub){
       this.mod.__set__(this.object_name,stub);
    }

    restore(){
        this.mod.__set__(this.object_name,this.original);
    }
}

describe('getDataBySigninId',()=>{
    const getDataBySigninId = index.__get__('getDataBySigninId');
    const testdata =  {
        id: 'test-001',
        description: JSON.stringify([
            { type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }
        ]),
        signinId: '1111-1111-1111'
    };
    before((done)=>{
        process.env.DB_REGION='us-west-2';
        documentClient.put({
            TableName: TBL_TrashSchedule,
            Item: testdata
        }).promise().then(()=>done());
    })
    it('IDあり',async()=>{
        const result = await getDataBySigninId('1111-1111-1111');
        assert.deepEqual(result,testdata);
    });
    it('IDなし',async()=>{
        const result = await getDataBySigninId('xxxx-xxxx-xxxx');
        assert.deepEqual(result,{});
    });
    after((done)=>{
        documentClient.delete({
            TableName: TBL_TrashSchedule,
            Key: {
                id: 'test-001'
            }
        }).promise().then(()=>{
            done();
        });
    });
})

describe('saveSession',()=>{
    const saveSession = index.__get__('saveSession');
    before((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: TBL_ThrowTrashSession,
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
        const session_data = {id: 'session001',expire: 3600};
        const result = await saveSession(session_data);
        assert.ok(result);

        documentClient.get({
            TableName: TBL_ThrowTrashSession,
            Key: {
                id: 'session001'
            }
        }).promise().then((data)=>{
            assert.equal(data.Item.id, 'session001');
        });
    });
    it('セッションテーブルに存在するデータ', async()=>{
        const session_data = {id: 'session002', expire: 3600,userInfo: undefined};
        const result = await saveSession(session_data);
        assert.ok(result);
        await documentClient.get({
            TableName: TBL_ThrowTrashSession,
            Key: {
                id: 'session002'
            }
        }).promise().then((data)=>{
            assert.equal(data.Item.id, 'session002');
            assert.equal(data.Item.userInfo, undefined);
        });
    });
    after((done)=>{
        documentClient.delete({
            TableName: TBL_ThrowTrashSession,
            Key: {
                id: 'session002'
            }
        }).promise().then(()=>done());
    });

});

describe('deleteSession',()=>{
    const deleteSession = index.__get__('deleteSession');
    before((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: TBL_ThrowTrashSession,
            Item:{
                id: 'test002',
                expire: 3600
            }
        }).promise().then(()=>done())
    });
    it('存在しないセッションIDを削除',async()=>{
        // パラメータはセッションID
        const result = await deleteSession('test001');
        // 削除は対象のIDが無くてもtrue
        assert.ok(result);
    });
    it('存在するセッション',async()=>{
        // パラメータはセッションID
        const result = await deleteSession('test002');
        // 削除は対象のIDが無くてもtrue
        assert.ok(result);

        await documentClient.get({
            TableName: TBL_ThrowTrashSession,
            Key:{
                id: 'test002'
            }
        // eslint-disable-next-line no-unused-vars
        }).promise().then(()=>assert.fail()).catch(err=>{assert.ok(true)});
    });
    after((done)=>{
        documentClient.delete({
            TableName: TBL_ThrowTrashSession,
            Key:{
                id: 'test002'
            }
        }).promise().then(()=>done()).catch(()=>done());
    })
});

describe('publishId',()=>{
    const publishId = index.__get__('publishId');
    const duplicate_id = 'xxxxxxxx-xxxxxxxx-xxxxxxx-xxxxxxxx';
    before((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.put({
            TableName: TBL_TrashSchedule,
            Item: {
                id: duplicate_id
            }
        }).promise().then(()=>done());
    });
    it('正常パターン',async()=>{
       const id = await publishId();
       assert.equal(id.length, 36);
    });
    it('5回重複が出た場合',async()=>{
        const generateId = index.__get__('generateId');
        index.__set__('generateId',()=>{return duplicate_id});
        try {
            const id = await publishId();
            // 5回続けてIDが重複した場合はnull
            assert.equal(id, null);
        } finally {
            index.__set__('generateId', generateId);
        }
    });
    after((done)=>{
        documentClient.delete({
            TableName: TBL_TrashSchedule,
            Key: {
                id: duplicate_id
            }
        }).promise().then(()=>done());
    });
});

describe('getSession', ()=>{
    const getSession = index.__get__('getSession');
    const session_id_001 = 'getSession_id_001';
    const session_id_002 = 'getSession_id_002';
    const session_id_003 = 'getSession_id_003';
    before((done)=>{
        process.env.DB_REGION = 'us-west-2';
        documentClient.batchWrite({
            RequestItems:{
                ThrowTrashSession: [
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
        const session = await getSession(session_id_001);
        assert.deepEqual(session, {id: session_id_001,expire: DEFAULT_EXPIRE});
    });
    it('有効期限切れ',async()=>{
        //有効期限切れであればnull
        const session = await getSession(session_id_002);
        assert.equal(session, null);
        // 有効期限切れのセッションは削除されていること
        documentClient.get({
            TableName: TBL_ThrowTrashSession,
            Key:{id: session_id_002}
        }).promise().then((data)=>{assert.equal(data.Item, undefined)});
    });
    it('sessionIdナシ',async()=>{
        //セッションIDが無ければnull
        const session = await getSession(session_id_003);
        assert.equal(session, null);
    });
    after((done)=>{
        documentClient.batchWrite({
            RequestItems:{
                ThrowTrashSession: [
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
    const publishSession = index.__get__('publishSession');
    before(()=>{
        process.env.DB_REGION = 'us-west-2';
    });
    it('publish new session id',async ()=>{
        const session = await publishSession();
        assert.equal(session.id.length,32);
        await documentClient.get({
            TableName: TBL_ThrowTrashSession,
            Key:{id: session.id}
        }).promise().then(async(data)=>{
            assert.equal(data.Item.id, session.id)
            await documentClient.delete({
                TableName: TBL_ThrowTrashSession,
                Key:{id: session.id}
            }).promise();
        });
    });
});

describe('backend test', ()=>{
    describe('backend regist',()=>{
        const regist = index.__get__('regist');
        const test_regist_data = [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }];
        const session_id_001 = 'session_id_001';
        const session_id_002 = 'session_id_002';
        const session_id_003 = 'session_id_003';
        const schedule_id_001 = 'schedule_id_001';
        const schedule_id_002 = 'schedule_id_002';
        const schedule_id_003 = 'schedule_id_003';
        before((done)=>{
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession: [
                        {
                            PutRequest: {
                                Item:{id: session_id_001}
                            }
                        },
                        {
                            PutRequest:{
                                Item:{id: session_id_002,userInfo:{signinId: 'amazon-xxxx'}}
                            }
                        },
                        {
                            PutRequest:{
                                Item:{id: session_id_003,userInfo:{signinId: 'google-xxxx'}}
                            }
                        }
                    ],
                    TrashSchedule: [
                        {
                            PutRequest: {
                                Item:{
                                    id: 'zzzz-zzzz-zzzz-zzzz',
                                    signinId: 'google-xxxx',
                                    signinService: 'google',
                                    description: JSON.stringify([{type: 'bottole',schedules:[{type: 'month', value: '13'}]}])
                                }
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });

        it('サインインしていないユーザー,プラットフォーム:amazon',async()=>{
            // 検証のため発行IDはmockで設定
            const publishId = new StubModule(index, 'publishId');
            publishId.set(async()=>{return schedule_id_001});

            try {
                // パラメータはリクエストパラメータ（登録データ）とセッション情報
                // セッションIDは呼び出し前に採番されるため、セッション情報は必ず存在する
                const response = await regist(
                    { data:  test_regist_data},
                    { id: session_id_001, redirect_uri: 'https://xxxx.com', state: 'state-value', client_id:'alexa-skill', platform: 'amazon' });
                assert.equal(response.statusCode, 200);
                assert.equal(response.body, `https://xxxx.com#state=state-value&access_token=${schedule_id_001}&client_id=alexa-skill&token_type=Bearer`);
                assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
                assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
                await documentClient.get({
                    TableName: TBL_TrashSchedule,
                    Key:{id: schedule_id_001}
                }).promise().then(async(data)=>{
                    assert.deepEqual(JSON.parse(data.Item.description),test_regist_data);
                    assert.equal(data.Item.platform, 'amazon');
                    await documentClient.get({
                        TableName: TBL_ThrowTrashSession,
                        Key:{id: session_id_001}
                    }).promise().then(data=>{
                        // 正常に登録した場合はセッションが削除されていること
                        assert.equal(data.Item,undefined);
                    });
                });
            } finally {
                publishId.restore();
            }
        });
        it('サインインしているユーザー（事前登録なし）,プラットフォーム:amazon',async()=>{
            const publishId = new StubModule(index, 'publishId');
            publishId.set(async()=>{return schedule_id_002});

            try {
                const response = await regist(
                    { data:  test_regist_data},
                    { 
                        id: session_id_002, redirect_uri: 'https://xxxx.com', state: 'state-value', client_id:'alexa-skill', platform: 'amazon',
                        userInfo: {
                            name: 'テストユーザー',
                            signinId: 'amazon-xxxx',
                            signinService: 'amazon'
                        }
                     });
                assert.equal(response.statusCode, 200);
                assert.equal(response.body, `https://xxxx.com#state=state-value&access_token=${schedule_id_002}&client_id=alexa-skill&token_type=Bearer`);
                assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
                assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
                await documentClient.get({
                    TableName: TBL_TrashSchedule,
                    Key:{id: schedule_id_002}
                }).promise().then(async(data)=>{
                    assert.deepEqual(JSON.parse(data.Item.description),test_regist_data);
                    assert.equal(data.Item.signinId, 'amazon-xxxx');
                    assert.equal(data.Item.signinService, 'amazon');
                    assert.equal(data.Item.platform, 'amazon');
                    await documentClient.get({
                        TableName: TBL_ThrowTrashSession,
                        Key:{id: session_id_002}
                    }).promise().then(data=>{
                        // 正常に登録した場合はセッションが削除されていること
                        assert.equal(data.Item,undefined);
                    });
                });
            } finally {
                publishId.restore();
            }
        });
        it('サインインしているユーザー（事前登録あり）,プラットフォーム:google',async()=>{
            const response = await regist(
                { data:  test_regist_data},
                { 
                    id: session_id_003, redirect_uri: 'https://xxxx.com', state: 'state-value', client_id:'alexa-skill', platform: 'google',
                    userInfo: {
                        name: 'テストユーザー',
                        signinId: 'google-xxxx',
                        signinService: 'google',
                        id: schedule_id_003
                    }
                    });
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, `https://xxxx.com#state=state-value&access_token=${schedule_id_003}&client_id=alexa-skill&token_type=Bearer`);
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
            await documentClient.get({
                TableName: TBL_TrashSchedule,
                    Key:{id: schedule_id_003}
            }).promise().then(async (data) => {
                assert.deepEqual(JSON.parse(data.Item.description), test_regist_data);
                assert.equal(data.Item.signinId, 'google-xxxx');
                assert.equal(data.Item.signinService, 'google');
                assert.equal(data.Item.platform, 'google');
                await documentClient.get({
                    TableName: TBL_ThrowTrashSession,
                    Key: { id: session_id_003 }
                }).promise().then(async(data) => {
                    // 正常に登録した場合はセッションが削除されていること
                    assert.equal(data.Item, undefined);
                    // firestore側の確認
                    await firestore.collection('schedule').doc(schedule_id_003).get().then(doc=>{
                        assert.ok(doc.exists);
                        assert.deepEqual(doc.data().data,test_regist_data)
                    });
                });
            });
        });
        it('登録データに誤りがある',async()=>{
            // スケジュールが空のデータ
            const response = await regist({data: []},
                { id: 'sessionId', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id:'alexa-skill', platform: 'amazon' }
            );
            assert.equal(response.statusCode, 400);
        });
        after((done)=>{
            const remove_list = [];
            remove_list.push(
                documentClient.batchWrite({
                    RequestItems: {
                        TrashSchedule: [
                            {
                                DeleteRequest: {
                                    Key: { id: schedule_id_001 }
                                },
                            },
                            {
                                DeleteRequest: {
                                    Key: { id: schedule_id_002 }
                                },
                            },
                            {
                                DeleteRequest: {
                                    Key: { id: schedule_id_003 }
                                }
                            }
                        ]
                    }
                }).promise()
            );
            remove_list.push(
                firestore.collection('schedule').doc(schedule_id_003).delete()
            );
            Promise.all(remove_list).then(()=>done());
        });
    });

    describe('backend signout',()=>{
        before((done)=>{
            process.env.DB_REGION = 'us-west-2';
            documentClient.put({
                TableName: TBL_ThrowTrashSession,
                Item: {
                    id: 'sessionId',
                    userInfo: {
                        name: 'test',
                        signinId: 'signin-id'
                    },
                    expire: 12456
                }
            }).promise().then(()=>done());
        });
        const signout = index.__get__('signout');
        it('通常のサインアウト',async()=>{
            // パラメータはセッション情報
            const response = await signout({id: 'sessionId', userInfo:{name: 'testUser', signinId: 'signin-id', signinService: 'amazon'},expire:12456});
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, 'signout');
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);

            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key:{id: 'sessionId'}
            }).promise().then(data=>{
                assert.equal(data.Item.userInfo, undefined);
                assert.equal(data.Item.expire, 12456);
            });
        });
        it('サインインしていない',async()=>{
            // サインインしていない場合にはsessionにuserInfoが無い
            const response = await signout({id: 'sessionId'});
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, '');
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
        });
        after((done)=>{
            documentClient.delete({
                TableName: TBL_ThrowTrashSession,
                Key:{id: 'sessionId'}
            }).promise().then(()=>done());
        });
    })
    describe('backend signin', ()=>{
        const signin = index.__get__('signin');
        const requestAmazonProfile = new StubModule(index, 'requestAmazonProfile');
        const requestGoogleProfile = new StubModule(index, 'requestGoogleProfile');
        const toHash = index.__get__('toHash');
        const amazonId = 'amazon-xxxxx';
        const googleId = 'google-xxxxx';

        const registed_data = [
            {
                type: 'burn',
                schedules: [
                    {
                        type: 'weekday',value:'1'
                    }
                ]
            }
        ];

        before((done)=>{
            process.env.DB_REGION = 'us-west-2';
            documentClient.put({
                TableName: TBL_TrashSchedule,
                Item: {
                    id: 'test002',
                    description: JSON.stringify(registed_data),
                    signinId: toHash(googleId),
                    signinService: 'google'
                }
            }).promise().then(()=>done());
        });
        beforeEach(()=>{
            // 外部サービス依存の部分はモックを使う
            // eslint-disable-next-line no-unused-vars
            requestAmazonProfile.set(async(access_token)=>{return {id: amazonId,name: 'テスト'}});
            // eslint-disable-next-line no-unused-vars
            requestGoogleProfile.set(async(code,domain,stage)=>{return {id: googleId,name: 'テスト2'}});
        })
        it('amazon-登録がないユーザー', async()=>{
            // パラメータはqueryStringParameters,セッション情報,ドメイン,APIステージ
            // セッション情報のチェックは呼び出し元で設定するため必ず存在する
            const response = await signin({access_token: '12345', service: 'amazon'},{id:'test001',version: 7},'backend.mythrowaway.net','v1');
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`)
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key:{
                    id: 'test001'
                }
            }).promise().then(data=>{
                console.log(data);
                assert.equal(data.Item.userInfo.signinId, toHash(amazonId));
                assert.equal(data.Item.userInfo.name, 'テスト');
                assert.equal(data.Item.userInfo.signinService, 'amazon');
                assert.deepEqual(data.Item.userInfo.preset,[]);
            });
        });
        it('google-登録済ユーザー', async()=>{
            const response = await signin({ code: '12345', state: 'google-state-value',service: 'google' },{id:'test002',version: 7,googleState: 'google-state-value'},'backend.mythrowaway.net','v1');
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`)
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {
                    id: 'test002'
                }
            }).promise().then(data=>{
                assert.equal(data.Item.userInfo.id, 'test002');
                assert.equal(data.Item.userInfo.signinId, toHash(googleId));
                assert.equal(data.Item.userInfo.name, 'テスト2');
                assert.equal(data.Item.userInfo.signinService, 'google');
                assert.equal(JSON.stringify(data.Item.userInfo.preset), JSON.stringify(registed_data));
            })
        });
        afterEach(()=>{
            requestAmazonProfile.restore();
            requestGoogleProfile.restore();
        });
        after((done)=>{
            documentClient.delete({
                TableName: TBL_TrashSchedule,
                Key: {
                    id: 'test002'
                }
            }).promise().then(()=>done())
        });
    })
    describe('google_signin', ()=>{
        const google_signin = index.__get__('google_signin');
        const generateState = new StubModule(index, 'generateState');
        const test_state = 'abcdefghijklmnop';
        before((done)=>{
            process.env.DB_REGION = 'us-west-2';
            // eslint-disable-next-line no-unused-vars
            generateState.set((length)=>{return test_state});
            documentClient.put({
                TableName: TBL_ThrowTrashSession,
                Item: {
                    id: 'test001',
                    expire: 1234567789
                }
            }).promise().then(()=>done());
        });
        it('正常リクエスト', async()=>{
            process.env.GOOGLE_CLIENT_ID='clientId';
            process.env.BackendURI='https://backend.net';
            // パラメータはセッション情報,ドメイン名,リクエストパス中のステージ
            // セッションは呼び出し元でチェックするので必ずセッション情報設定される
            const response = await google_signin({ id: 'test001' },'backend.mythrowaway.net','v7');
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `https://accounts.google.com/o/oauth2/v2/auth?client_id=clientId&response_type=code&scope=openid profile&redirect_uri=https://backend.mythrowaway.net/v7/signin?service=google&state=${test_state}&login_hint=mythrowaway.net@gmail.com&nonce=${test_state}`);
            assert.equal(response.headers['Cache-Control'], 'no-store');
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {
                    id: 'test001'
                }
            }).promise().then(data => {
                assert.equal(data.Item.googleState, test_state);
            });
        });
        after((done)=>{
            generateState.restore();
            documentClient.delete({
                TableName: TBL_ThrowTrashSession,
                Key: {
                    id: 'test001'
                }
            }).promise().then(()=>done());
        });
    });
    describe('oauth_request', ()=>{
        const oauth_request = index.__get__('oauth_request');
        before(()=>{
            process.env.DB_REGION = 'us-west-2'
        });
        it('新規リクエスト',async ()=>{
            // 第1引数にリクエストパラメータ,第2引数にセッション情報,第3引数に新規に発行したセッションを示すフラグ
            // セッション情報はメソッド呼び出し前に本体で設定されるため必ず存在する
            const response = await oauth_request({
                state:'123456',
                client_id:'alexa-skill',
                redirect_uri: 'https://xxxx.com',
                platform: 'amazon',
                version: '5'
            },{id: 'test001'},true);
            assert.equal(response.statusCode, 301);
            const headers = response.headers;
            assert.equal(headers.Location, `${URL_ACCOUNT_LINK}/v5/index.html`);
            assert.equal(headers['Set-Cookie'],'throwaway-session=test001;max-age=3600;');

            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key:{
                    id: 'test001'
                }
            }).promise().then(data=>{
                assert.equal(data.Item.id, 'test001');
                assert.equal(data.Item.state, '123456');
                assert.equal(data.Item.client_id, 'alexa-skill');
                assert.equal(data.Item.platform, 'amazon');
                assert.equal(data.Item.redirect_uri, 'https://xxxx.com');
                assert.equal(data.Item.version, '5');
            })
        });
        it('セッション登録済み',async()=>{
            const response = await oauth_request({
                state:'123456',
                client_id:'alexa-skill',
                redirect_uri: 'https://xxxx.com',
                platform: 'amazon',
                version: '5'
            },{id: 'test002',expire: DEFAULT_EXPIRE},false);
            assert.equal(response.statusCode, 301);
            const headers = response.headers;
            assert.equal(headers.Location, `${URL_ACCOUNT_LINK}/v5/index.html`);
            assert.equal(headers['Set-Cookie'],undefined);

            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key:{
                    id: 'test002'
                }
            }).promise().then(data=>{
                assert.equal(data.Item.id, 'test002');
                assert.equal(data.Item.state, '123456');
                assert.equal(data.Item.client_id, 'alexa-skill');
                assert.equal(data.Item.platform, 'amazon');
                assert.equal(data.Item.redirect_uri, 'https://xxxx.com');
                assert.equal(data.Item.version, '5');
                assert.equal(data.Item.expire, DEFAULT_EXPIRE);
            });
        })
        after((done)=>{
            documentClient.batchWrite({
                RequestItems:{
                    ThrowTrashSession: [
                        {
                            DeleteRequest:{Key:{id: 'test001'}}
                        },
                        {
                            DeleteRequest:{Key:{id: 'test002'}}
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
    });
});

describe('handler',()=>{
    const handler = index.handler;
    const session_id_001 = 'oauth_request_session_id_001';
    const session_id_002 = 'oauth_request_session_id_002';
    before((done)=>{
        documentClient.batchWrite({
            RequestItems: {
                ThrowTrashSession: [
                    {
                        PutRequest: {
                            Item: {
                                id: session_id_001,
                                expire: DEFAULT_EXPIRE
                            }
                        }
                    },
                    {
                        PutRequest: {
                            Item: {
                                id: session_id_002,
                                expire: 1
                            }
                        }
                    }
                ]
            }
        }).promise().then(()=>done());
    });
    describe('handler /oauth_request',()=>{
        it('セッションなし',async()=>{
            const extractSessionId = index.__get__('extractSessionId');
            const response = await handler({
                    resource: '/oauth_request',
                    queryStringParameters: {
                        state: '12345',
                        client_id: 'alexa-skill',
                        redirect_uri: 'https://xxxxx.com',
                        version: 7,
                        platform: 'amazon'
                    },
                    headers: {
                    }
                });
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`)
            assert.equal(response.headers['Set-Cookie'].indexOf('throwaway-session='), 0);
            const sessionId = extractSessionId(response.headers['Set-Cookie']);
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: sessionId}
            }).promise().then(async(data)=>{
                assert.equal(data.Item.id, sessionId);
                await documentClient.delete({
                    TableName: TBL_ThrowTrashSession,
                    Key: {id: sessionId}
                }).promise();
            });
        });
        it('セッションあり',async()=>{
            const response = await handler({
                    resource: '/oauth_request',
                    queryStringParameters: {
                        state: '12345',
                        client_id: 'alexa-skill',
                        redirect_uri: 'https://xxxxx.com',
                        version: 7,
                        platform: 'amazon'
                    },
                    headers: {
                        Cookie: `throwaway-session=${session_id_001}; max-age=3600;`
                    }
                });
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`)
            assert.equal(response.headers['Set-Cookie'], undefined);
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: session_id_001}
            }).promise().then(async(data)=>{
                assert.equal(data.Item.id, session_id_001);
            });
        });
        it('セッションの有効期限切れ',async()=>{
            const response = await handler({
                    resource: '/oauth_request',
                    queryStringParameters: {
                        state: '12345',
                        client_id: 'alexa-skill',
                        redirect_uri: 'https://xxxxx.com',
                        version: 7,
                        platform: 'amazon'
                    },
                    headers: {
                        Cookie: `throwaway-session=${session_id_002}; max-age=3600;`
                    }
                });
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`)
            assert.ok(response.headers['Set-Cookie']);
            // 有効期限切れのセッションIDは削除されていること
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: session_id_002}
            }).promise().then(async(data)=>{
                assert.equal(data.Item, undefined);
            });
        });
        it('パラメータなし',async()=>{
            const response = await handler({
                    resource: '/oauth_request',
                    headers: {
                    }
                });
            assert.equal(response.statusCode, 301);
            const headers = response.headers;
            assert.equal(headers.Location, URL_400);
        });
    })
    after((done)=>{
        documentClient.batchWrite({
            RequestItems: {
                ThrowTrashSession: [
                    {
                        DeleteRequest: {
                            Key: {id: session_id_001}
                        }
                    }
                ]
            }
        }).promise().then(()=>done());
    });
    describe('handler /google_signin',()=>{
        const generateState = new StubModule(index, 'generateState');
        const session_id_001 = 'google_signin_session_id_001';
        let event = {};
        before((done)=>{
            process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
            generateState.set(()=>{return 'test-generated-state'});
            documentClient.put({
                TableName: TBL_ThrowTrashSession,
                Item:{id: session_id_001, expire: DEFAULT_EXPIRE}
            }).promise().then(()=>done());
        });
        beforeEach(()=>{
            event = {resource: '/google_signin', headers:{}, requestContext:{domainName: 'backend.mythrowaway.net',stage: 'v1'}};
        });
        it('セッションあり', async()=>{
            event.headers = {
                Cookie: `throwaway-session=${session_id_001}`
            };
            const response = await handler(event,{});
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location,`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&scope=openid profile&redirect_uri=https://backend.mythrowaway.net/v1/signin?service=google&state=test-generated-state&login_hint=mythrowaway.net@gmail.com&nonce=test-generated-state`);
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key:{id: session_id_001}
            }).promise().then(data=>{
                assert.equal(data.Item.googleState, 'test-generated-state');
            });
        });
        it('セッションなし',async()=>{
            const response = await handler(event,{});
            // セッションが無いユーザーのアクセスはユーザーエラー
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, URL_400);
        })
        after((done)=>{
            generateState.restore();
            documentClient.delete({
                TableName: TBL_ThrowTrashSession,
                Key:{id: session_id_001}
            }).promise().then(()=>done());
        });
    });
    describe('handler signin', ()=>{
        let event = {};
        const session_id_001 = 'signin_session_id_001';
        const session_id_002 = 'signin_session_id_002';
        const schedule_id_001 = 'signin_test_id_001';
        const signin_id_001 = 'signin_signin_id_001';
        const signin_id_002 = 'signin_signin_id_002';
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}];
        const requestAmazonProfile = new StubModule(index, 'requestAmazonProfile');
        const requestGoogleProfile = new StubModule(index, 'requestGoogleProfile');
        const toHash = index.__get__('toHash');
        before((done)=>{
            // 外部サービス依存の部分はモックを使う
            // eslint-disable-next-line no-unused-vars
            requestAmazonProfile.set(async(access_token)=>{return {id: signin_id_001,name: 'テスト'}});
            // eslint-disable-next-line no-unused-vars
            requestGoogleProfile.set(async(code,domain,stage)=>{return {id: signin_id_002,name: 'テスト2'}});
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession: [
                        {
                            PutRequest:{
                                Item:{id: session_id_001, expire: DEFAULT_EXPIRE, version: 7}
                            }
                        },
                        {
                            PutRequest:{
                                Item:{id: session_id_002, expire: DEFAULT_EXPIRE, version:7, googleState: 'google-state'}
                            }
                        }
                    ],
                    TrashSchedule: [
                        {
                            PutRequest: {
                                Item:{
                                    id: schedule_id_001,
                                    signinId: toHash(signin_id_001),
                                    signinService: 'amazon',
                                    description: JSON.stringify(test_data_001)
                                }
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
        beforeEach(()=>{
            event.resource = '/signin';
            event.headers = {};
            event.requestContext = {stage: 'test'};
            event.requestContext = {
                domainName: 'backend.mythrowaway.net',
                stage: 'v1'
            }
        })
        it('セッションあり,プリセットあり,amazon',async()=>{
            event.queryStringParameters = {access_token: 'access-token', service: 'amazon'};
            event.headers.Cookie = `throwaway-session=${session_id_001};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`);
            assert.equal(response.headers['Cache-Control'], 'no-store');
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: session_id_001}
            }).promise().then(data=>{
                assert.deepEqual(
                    data.Item.userInfo,
                    {
                        name: 'テスト',
                        signinId: toHash(signin_id_001),
                        signinService: 'amazon',
                        id: schedule_id_001,
                        preset: test_data_001
                    }
                );
            });
        });
        it('セッションあり,プリセットなし,google',async()=>{
            event.queryStringParameters = {state: 'google-state', service: 'google', code: '12345'};
            event.headers.Cookie = `throwaway-session=${session_id_002};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, `${URL_ACCOUNT_LINK}/v7/index.html`);
            assert.equal(response.headers['Cache-Control'], 'no-store');
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: session_id_002}
            }).promise().then(data=>{
                assert.deepEqual(
                    data.Item.userInfo,
                    {
                        name: 'テスト2',
                        signinId: toHash(signin_id_002),
                        signinService: 'google',
                        preset: []
                    }
                );
            });
        });
        it('セッションなし',async()=>{
            event.queryStringParameters = {state: 'google-state', service: 'google'};
            const response = await handler(event,{});
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, URL_400);
        });
        after((done)=>{
            requestAmazonProfile.restore();
            requestGoogleProfile.restore();
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession: [
                        {
                            DeleteRequest:{
                                Key:{id: session_id_001}
                            }
                        },
                        {
                            DeleteRequest:{
                                Key:{id: session_id_002}
                            }
                        }
                    ],
                    TrashSchedule: [
                       { 
                            DeleteRequest: {
                                Key:{id: schedule_id_001}
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
    });
    describe('handler /signout', ()=>{
        let event = {};
        const session_id_001 = 'session_id_001';
        const session_id_002 = 'session_id_002';
        before((done)=>{
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession: [
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_001,
                                    expire: DEFAULT_EXPIRE,
                                    userInfo: {
                                        name: 'テスト',
                                        signinId: 'signinId',
                                        signinService: 'amazon',
                                        preset: []
                                    }
                                }
                            }
                        },
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_002,
                                    expire: DEFAULT_EXPIRE
                                }
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
        beforeEach(()=>{
            event.resource = '/signout';
            event.headers = {};
        });
        it('サインイン済み', async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_001};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, 'signout');
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
            await documentClient.get({
                TableName: TBL_ThrowTrashSession,
                Key: {id: session_id_001}
            }).promise().then(data=>{
                assert.equal(data.Item.id, session_id_001);
                assert.equal(data.userInfo, undefined);
            });
        });
        it('サインインしていない', async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_002};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, '');
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
        });
        it('セッションなし', async()=>{
            const response = await handler(event,{});
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, URL_400);
        });
        after((done)=>{
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession: [
                        {
                            DeleteRequest: {
                                    Key:{id: session_id_001}
                            }
                        },
                        {
                            DeleteRequest: {
                                    Key:{id: session_id_002}
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
    });
    describe('handler regist',()=>{
        let event = {};
        const session_id_001 = 'regist_session_id_001';
        const session_id_002 = 'regist_session_id_002';
        const session_id_003 = 'regist_session_id_003';
        const session_id_004 = 'regist_session_id_004';
        const session_id_005 = 'regist_session_id_005';
        const signin_id_002 = 'regist_signin_id_002';
        const signin_id_003 = 'regist_signin_id_003';
        const schedule_id_001 = 'regist_schedule_id_001';
        const schedule_id_002 = 'regist_schedule_id_002';
        const schedule_id_003 = 'regist_schedule_id_003';
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'},{},{}]}];
        const test_data_002 = [{type: 'bottole',schedules:[{type: 'weekday', value: '0'}]}];
        const test_data_003 = [{type: 'burn',schedules:[{type: 'weekday', value: '0'}]}];

        const publishId = new StubModule(index, 'publishId');
        before((done)=>{
            documentClient.batchWrite({
                RequestItems: {
                    ThrowTrashSession:[
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_001,
                                    expire: DEFAULT_EXPIRE,
                                    state: '12345',
                                    client_id: 'alexa-skill',
                                    redirect_uri: 'https://xxxxx.com',
                                    version: 7,
                                    platform: 'amazon'
                                }
                            }
                        },
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_002,
                                    expire: DEFAULT_EXPIRE,
                                    state: '12345',
                                    client_id: 'alexa-skill',
                                    redirect_uri: 'https://xxxxx.com',
                                    version: 7,
                                    platform: 'amazon',
                                    userInfo: {
                                        signinId: signin_id_002,
                                        name: 'テストユーザー',
                                        signinService: 'amazon',
                                        preset: []
                                    }
                                }
                            }
                        },
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_003,
                                    expire: DEFAULT_EXPIRE,
                                    state: '12345',
                                    client_id: 'alexa-skill',
                                    redirect_uri: 'https://xxxxx.com',
                                    version: 7,
                                    platform: 'google',
                                    userInfo: {
                                        signinId: signin_id_003,
                                        name: 'テストユーザー',
                                        signinService: 'amazon',
                                        preset: [{type: 'resource', schedules:[{type: 'biweek',value: '0-3'}]}],
                                        id: schedule_id_003
                                    }
                                }
                            }
                        },
                        {
                            PutRequest: {
                                Item: {
                                    id: session_id_004,
                                    expire: DEFAULT_EXPIRE,
                                    state: '12345',
                                    client_id: 'alexa-skill',
                                    redirect_uri: 'https://xxxxx.com',
                                    version: 7,
                                    platform: 'amazon'
                                }
                            }
                        },
                        {
                            // stateが無い不正なセッション
                            PutRequest: {
                                Item: {
                                    id: session_id_005,
                                    expire: DEFAULT_EXPIRE,
                                    client_id: 'alexa-skill',
                                    redirect_uri: 'https://xxxxx.com',
                                    version: 7,
                                    platform: 'amazon'
                                }
                            }
                        }
                    ],
                    TrashSchedule: [
                        {
                            PutRequest: {
                                Item: {
                                    id: schedule_id_003,
                                    signinId: signin_id_003,
                                    signinService: 'amazon',
                                    description: JSON.stringify([{type: 'resource', schedules:[{type: 'biweek',value: '0-3'}]}])
                                }
                            }
                        }
                    ]
                }
            }).promise().then(()=>done());
        });
        beforeEach(()=>{
            event.resource = '/regist';
            event.headers = {};
        });
        it('サインインなし,プラットフォーム：amazon', async()=>{
            // テスト対象データ特定のためpublishIdの戻り値を固定
            publishId.set(async()=>{return schedule_id_001});
            event.headers.Cookie = `throwaway-session=${session_id_001};`;
            event.body = JSON.stringify({data: test_data_001});
            try {
                const response = await handler(event,{});
                assert.equal(response.statusCode, 200);
                assert.equal(response.body, `https://xxxxx.com#state=12345&access_token=${schedule_id_001}&client_id=alexa-skill&token_type=Bearer`);
                assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
                assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
                await documentClient.get({
                    TableName: TBL_TrashSchedule,
                    Key: {id: schedule_id_001}
                }).promise().then(async(data)=>{
                    // データは最適化（adjustData）されて登録される
                    assert.deepEqual(JSON.parse(data.Item.description), [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}]);
                    await documentClient.get({
                        TableName: TBL_ThrowTrashSession,
                        Key: {id: schedule_id_001}
                    }).promise().then(data=>{
                        assert.equal(data.Item, undefined);
                    });
                });
            } finally {
                publishId.restore();
            }
        });
        it('サインインあり、プリセットなし、プラットフォーム：amazon', async()=>{
            // テスト対象データ特定のためpublishIdの戻り値を固定
            publishId.set(async()=>{return schedule_id_002});
            event.headers.Cookie = `throwaway-session=${session_id_002};`;
            event.body = JSON.stringify({data: test_data_002});
            try {
                const response = await handler(event,{});
                assert.equal(response.statusCode, 200);
                assert.equal(response.body, `https://xxxxx.com#state=12345&access_token=${schedule_id_002}&client_id=alexa-skill&token_type=Bearer`);
                assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
                assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
                await documentClient.get({
                    TableName: TBL_TrashSchedule,
                    Key: {id: schedule_id_002}
                }).promise().then(async(data)=>{
                    assert.deepEqual(JSON.parse(data.Item.description), test_data_002);
                    await documentClient.get({
                        TableName: TBL_ThrowTrashSession,
                        Key: {id: schedule_id_002}
                    }).promise().then(data=>{
                        assert.equal(data.Item, undefined);
                    });
                });
            } finally {
                publishId.restore();
            }
        });
        it('サインインあり、プリセットあり、プラットフォーム:google', async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_003};`;
            event.body = JSON.stringify({data: test_data_003});
            try {
                const response = await handler(event,{});
                assert.equal(response.statusCode, 200);
                assert.equal(response.body, `https://xxxxx.com#state=12345&access_token=${schedule_id_003}&client_id=alexa-skill&token_type=Bearer`);
                assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
                assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
                await documentClient.get({
                    TableName: TBL_TrashSchedule,
                    Key: {id: schedule_id_003}
                }).promise().then(async(data)=>{
                    assert.deepEqual(JSON.parse(data.Item.description), test_data_003);
                    await documentClient.get({
                        TableName: TBL_ThrowTrashSession,
                        Key: {id: schedule_id_003}
                    }).promise().then(async(data)=>{
                        assert.equal(data.Item, undefined);
                        //firestore側の確認
                        await firestore.collection('schedule').doc(schedule_id_003).get().then(doc=>{
                            assert.ok(doc.exists);
                            assert.deepEqual(doc.data().data,test_data_003);
                        });
                    });
                });
            } finally {
                publishId.restore();
            }
        });
        it('登録データ指定無し',async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_004};`;
            event.body = null;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 400);
            assert.equal(response.body, 'Bad Data');
        });
        it('登録データフォーマット異常',async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_004};`;
            event.body = JSON.stringify({data:[{}]});
            const response = await handler(event,{});
            assert.equal(response.statusCode, 400);
            assert.equal(response.body, 'Bad Data');
        });
        it('セッションなし',async()=>{
            event.body = null;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 400);
            assert.equal(response.body, 'Invalid Session');
        });
        it('セッションパラメータ異常',async()=>{
            event.headers.Cooki = `throwaway-session=${session_id_005};`;
            const response = await handler(event,{})
            assert.equal(response.statusCode, 400);
            assert.equal(response.body, 'Invalid Session');
        })
        after((done)=>{
            const remove_list = [];
            remove_list.push(
                documentClient.batchWrite({
                    RequestItems: {
                        ThrowTrashSession: [
                            {
                                DeleteRequest: {
                                    Key: { id: session_id_004 }
                                }
                            },
                            {
                                DeleteRequest: {
                                    Key: { id: session_id_005 }
                                }
                            }
                        ],
                        TrashSchedule: [
                            {
                                DeleteRequest: {
                                    Key: { id: schedule_id_003 }
                                }
                            }
                        ]
                    }
                }).promise()
            );
            remove_list.push(
                firestore.collection('schedule').doc(schedule_id_003).delete()
            );
            Promise.all(remove_list).then(()=>done());
        });
    });
    describe('handler /user_info', async()=>{
        const session_id_001 = 'userinfo_session_id_001';
        const session_id_002 = 'userinfo_session_id_002';
        const signin_id_001 = 'userinfo_signin_id_001';
        const schedule_id_001 = 'userinfo_schedule_id_001';
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}];
        const signin_name_001 = 'テストユーザー';
        let event = {};
        before((done)=>{
            documentClient.put({
                TableName: TBL_ThrowTrashSession,
                Item: {
                    id: session_id_001,
                    expire: DEFAULT_EXPIRE,
                    userInfo: {
                        signinId: signin_id_001,
                        signinService: 'amazon',
                        preset: test_data_001,
                        name: signin_name_001,
                        id: schedule_id_001
                    }
                }
            }).promise().then(()=>done());
        })
        beforeEach(()=>{
            event.resource = '/user_info';
            event.headers = {};
        });
        it('セッションあり,サインインあり',async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_001};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 200);
            assert.deepEqual(JSON.parse(response.body),{name: signin_name_001, preset: test_data_001});
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
        }),
        it('セッションあり,サインインなし',async()=>{
            event.headers.Cookie = `throwaway-session=${session_id_002};`;
            const response = await handler(event,{});
            assert.equal(response.statusCode, 200);
            assert.deepEqual(JSON.parse(response.body),{name: null, preset: null});
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
            assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
        });
        it('セッションなし',async()=>{
            const response = await handler(event,{});
            assert.equal(response.statusCode, 200);
            // user_infoは非同期で呼び出されるためエラー時のステータスコードも200とする
            assert.deepEqual(JSON.parse(response.body),{name: null, preset: null});
        });
        after((done)=>{
            documentClient.delete({
                TableName: TBL_ThrowTrashSession,
                Key:{id: session_id_001}
            }).promise().then(()=>done());
        });
    })
});