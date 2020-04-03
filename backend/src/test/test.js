process.env.DB_REGION = 'us-west-2';
const AWS = require('aws-sdk');

const rewire = require('rewire');
const index = rewire('../index.js');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();
const assert = require('assert');

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

const URL_400 = 'https://accountlink.mythrowaway.net/400.html';
const URL_ACCOUNT_LINK = 'https://accountlink.mythrowaway.net';

describe('extract session',()=>{
    const extractSessionId = index.__get__('extractSessionId');
    it('通常パターン', ()=>{
        const cookie = 'throwaway-session=hogehoge;max-age=3600';
        // API Gatewayのheadersから取得したCookieを渡す
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it(';にブランクが入っている', ()=>{
        const cookie = 'throwaway-session=hogehoge; max-age=3600';
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it('sessionidは中盤', ()=>{
        const cookie = 'a=aaaaa;throwaway-session=hogehoge;max-age=3600';
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it('sessionidは中盤で;にブランクが入っている', ()=>{
        const cookie = 'a=aaaa; throwaway-session=hogehoge; max-age=3600';
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it('sessionidが最後（;が無い）', ()=>{
        const cookie = 'max-age=3600;throwaway-session=hogehoge';
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it('sessionidのみ', ()=>{
        const cookie = 'throwaway-session=hogehoge';
        const sessionId = extractSessionId(cookie);
        assert.equal(sessionId, 'hogehoge');
    });
    it('sessionidが無い', ()=>{
        const cookie = 'max-age=3600';
        const sessionId = extractSessionId(cookie);
        // sessionidが無ければnullを返す
        assert.equal(sessionId, null);
    });
    it('cookieが無い', ()=>{
        const sessionId = extractSessionId(undefined);
        // cookieが無ければnullを返す
        assert.equal(sessionId, null);
    });
});
describe('getSession', ()=>{
    const getSession = index.__get__('getSession');
    it('有効期限内',async ()=>{
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns({
            promise: async () => {
                //expire = 2019-12-08T09:11:57.300Z
                return { Item: { id: 'hogehoge', expire: 1575796317300 } };
            }
        });
        const stub = sinon.stub(Date.prototype,'getTime');
        stub.returns(1475796317300);
        try {
            //有効期限内なら取り出したセッションを返す
            const session = await getSession('hogehoge');
            assert.equal(session.id, 'hogehoge');
            assert.equal(session.expire, 1575796317300);
        } finally {
            stub.restore();
            sandbox.restore();
        }
    });
    it('有効期限切れ',async()=>{
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns({
            promise: async () => {
                return {Item:{id:'hogehoge',expire: 1575796317300}}
            }
        });
        const stub = sinon.stub(Date.prototype,'getTime');
        stub.returns(1675796317300);
        try {
            //有効期限切れであればnull
            const session = await getSession('hogehoge');
            assert.equal(session, null);
        } finally {
            stub.restore();
            sandbox.restore();
        }
    });
    it('有効期限と同じ',async()=>{
        const stub = sinon.stub(Date.prototype,'getTime');
        stub.returns(1575796317300);
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns({
            promise: async () => {
                return {Item:{id:'hogehoge',expire: 1575796317300}}
            }
        });
        try {
            //有効期限までは許容
            const session = await getSession('hogehoge');
            assert.equal(session.id, 'hogehoge');
            assert.equal(session.expire, 1575796317300);
        } finally {
            stub.restore();
            sandbox.restore();
        }
    });
    it('sessionIdで見つからない場合',async()=>{
        const stub = sinon.stub(Date.prototype,'getTime');
        stub.returns(1575796317300);
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns({
            promise: async () => {
                return {};
            }
        });
        try {
            //指定のsessionIdで見つからない場合はnull
            const session = await getSession('hogehoge');
            assert.equal(session, null);
        } finally {
            stub.restore();
            sandbox.restore();
        }
    });
    it('DB取得でエラー',async()=>{
        const stub = sinon.stub(Date.prototype,'getTime');
        stub.returns(1575796317300);
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns({
            promise: async()=>{
                throw new Error('DB Get Error');
            }
        });
        try {
            //DBのgetがエラーの場合はnull
            const session = await getSession('hogehoge');
            assert.equal(session, null);
        } finally {
            stub.restore();
            sandbox.restore();
        }
    });
});
describe('generateId',()=> {
    const generateId = index.__get__('generateId');
    it('separatorナシ', ()=>{
        assert.equal(generateId().length,32);
    });
    it('separatorあり', ()=>{
        assert.equal(generateId('-').length,36);
    });
});
describe('publishSession',()=>{
    const publishSession = index.__get__('publishSession');
    it('publish new session id',async ()=>{
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype,'put').returns({
            promise: async()=>{
                return 'This is AWS mock';
            }
        });
        try {
            const session = await publishSession();
            assert.equal(session.id.length,32);
        } finally {
            sandbox.restore();
        }
    });
    it('DB登録でエラー',async ()=>{
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype,'put').returns({
            promise: async()=>{
                throw new Error('DB Put Error');
            }
        });
        try {
            const session = await publishSession();
            assert.equal(session, null);
        } finally {
            sandbox.restore();
        }
    });
});
describe('generateState',()=>{
    const generateState = index.__get__('generateState');
    it('16文字',()=>{
        //指定した文字数分のランダム値を返す
        const state = generateState(16);
        assert.equal(state.length, 16);
    });
    it('32文字（最大）',()=>{
        const state = generateState(32);
        assert.equal(state.length, 32);
    });
    it('1文字（最小）',()=>{
        const state = generateState(1);
        assert.equal(state.length, 1);
    });
    it('0文字（エラー）',()=>{
        //0文字以下はnullを返す。
        const state = generateState(0);
        assert.equal(state, null);
    })
    it('37文字（エラー）',()=>{
        //36文字を超えるとnullを返す。
        const state = generateState(37);
        assert.equal(state, null);
    })
});

describe('user_info', ()=>{
    const user_info = index.__get__('user_info');
    it('セッションあり,サインインあり', ()=>{
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}];
        // パラメータはセッション情報
        const response = user_info(
            {
                id: 'sessionid', 
                userInfo: { 
                    name: 'testUser', 
                    signinId: 'signin-id', 
                    signinService: 'amazon',
                    preset: test_data_001
                }
            }
        );
        assert.equal(response.statusCode, 200);
        assert.deepEqual(JSON.parse(response.body),{name: 'testUser', preset: test_data_001});
        assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
        assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
    });
    it('セッションあり,サインインなし',()=>{
        const response = user_info({id: 'sessionid'});
        assert.equal(response.statusCode, 200);
        assert.deepEqual(JSON.parse(response.body),{name: null, preset: null});
        assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
        assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
    });
    it('セッションなし',()=>{
        const response = user_info(null);
        assert.equal(response.statusCode, 200);
        assert.deepEqual(JSON.parse(response.body),{name: null, preset: null});
    });
})

describe('regist', () => {
    const regist = index.__get__('regist');
    const registData = new StubModule(index, 'registData');
    const deleteSession = new StubModule(index, 'deleteSession');
    const publishId = new StubModule(index, 'publishId');

    it('正常なリクエスト', async () => {
        // eslint-disable-next-line no-unused-vars
        registData.set(async (item, regist_data) => { return true });
        // eslint-disable-next-line no-unused-vars
        deleteSession.set(async (sessionId) => { return true });
        publishId.set(async () => { return 'new-id' });
        // パラメータはリクエストパラメータ（登録データ）とセッション情報
        // セッションIDは呼び出し前に採番されるため、セッション情報は必ず存在する
        const response = await regist({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] },
            { id: 'sessionId', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' });
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'https://xxxx.com#state=state-value&access_token=new-id&client_id=alexa-skill&token_type=Bearer');
        assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
        assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
    });
    it('登録データに誤りがある', async () => {
        // パラメータはリクエストパラメータ（登録データ）とセッション情報
        const response = await regist({ data: [] },
            { id: 'sessionId', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' }
        );
        assert.equal(response.statusCode, 400);
        assert.equal(response.body, 'Bad Data');
    });
    it('DB登録時にエラー', async () => {
        // eslint-disable-next-line no-unused-vars
        registData.set(async (platform) => { return false });
        const response = await regist({ data: [{ type: 'burn', schedules: [{ type: 'weekday', value: '0' }] }] },
            { id: 'sessionId', redirect_uri: 'https://xxxx.com', state: 'state-value', client_id: 'alexa-skill', platform: 'amazon' });
        assert.equal(response.statusCode, 500);
        assert.equal(response.body, 'Registration Failed');
    });
    afterEach(() => {
        registData.restore();
        deleteSession.restore();
        publishId.restore();
    })
});
describe('signout', () => {
    const signout = index.__get__('signout');
    it('通常のサインアウト', async () => {
        const saveSession = new StubModule(index, 'saveSession');
        // eslint-disable-next-line no-unused-vars
        saveSession.set(async (session) => { return { id: 'sessionId' } });
        try {
            // パラメータはセッション情報
            const response = await signout({ id: 'sessionId', userInfo: { name: 'testUser', signinId: 'signin-id', signinService: 'amazon' } });
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, 'signout');
            assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
        assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
        } finally {
            saveSession.restore();
        }
    });
    it('サインインしていない', async () => {
        // サインインしていない場合にはsessionにuserInfoが無い
        const response = await signout({ id: 'sessionId' });
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, '');
        assert.equal(response.headers['Access-Control-Allow-Origin'], URL_ACCOUNT_LINK);
        assert.equal(response.headers['Access-Control-Allow-Credentials'], true);
    });
})
describe('signin', () => {
    const signin = index.__get__('signin');
    const getDataBySigninId = new StubModule(index, 'getDataBySigninId');
    const requestAmazonProfile = new StubModule(index, 'requestAmazonProfile');
    const requestGoogleProfile = new StubModule(index, 'requestGoogleProfile');
    const saveSession = new StubModule(index, 'saveSession');
    before(() => {
        saveSession.set(async (session) => { return session });
    });
    beforeEach(() => {
        // eslint-disable-next-line no-unused-vars
        getDataBySigninId.set(async (id) => { return { id: 'signinid', description: '{}' } });
        // eslint-disable-next-line no-unused-vars
        requestAmazonProfile.set(async (access_token) => { return { id: 'amazon-xxxxx', name: 'テスト' } });
        // eslint-disable-next-line no-unused-vars
        requestGoogleProfile.set(async (code,domain,stage) => { return { id: 'google-xxxxx', name: 'テスト' } });
    })
    it('amazon', async () => {
        // パラメータはqueryStringParameters,ドメイン名,APIステージ
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, 'https://accountlink.mythrowaway.net/v7/index.html')
            assert.equal(response.headers['Cache-Control'], 'no-store');
    });
    it('google', async () => {
        const response = await signin({ code: '12345', state: 'google-state-value', service: 'google' }, { id: 'session-id', version: 7, googleState: 'google-state-value' },'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, 'https://accountlink.mythrowaway.net/v7/index.html')
        assert.equal(response.headers['Cache-Control'], 'no-store');
    })
    it('規定外のサービス', async () => {
        const response = await signin({ code: '12345', service: 'another' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net','test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, URL_400);
    })
    it('セッションIDが無い', async () => {
        const response = await signin({ code: '12345', service: 'another' }, undefined, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        // セッションIDの不正はユーザーエラー
        assert.equal(response.headers.Location, URL_400);
    })
    it('サービスへのリクエストエラー', async () => {
        // eslint-disable-next-line no-unused-vars
        requestAmazonProfile.set(async (access_token) => {return null});
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        // サービスリクエスト異常はサーバーエラー
        assert.equal(response.headers.Location, 'https://accountlink.mythrowaway.net/500.html');
    });
    it('データ取得エラー', async () => {
        // eslint-disable-next-line no-unused-vars
        getDataBySigninId.set(async (access_token) => { return null});
        const response = await signin({ access_token: '12345', service: 'amazon' }, { id: 'session-id' }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        // 登録データ取得異常はサーバーエラー
        assert.equal(response.headers.Location, 'https://accountlink.mythrowaway.net/500.html');
    });
    it('パラーメーターの不足（Google,codeがない）', async () => {
        const response = await signin({ service: 'google' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, URL_400);
    });
    it('パラーメーターの不足（Google,state不一致）', async () => {
        const response = await signin({ code: 1234, service: 'google', state: 'invalid-state' }, { id: 'session-id', version: 7, state: 'valid-state' }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, URL_400);
    });
    it('パラメーターの不足（Google,stateが無い）', async () => {
        // eslint-disable-next-line no-unused-vars
        requestAmazonProfile.set(async (access_token) => { throw new Error('Service Request Error'); });
        const response = await signin({ code: '12345', service: 'google' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, URL_400);
    });
    it('パラーメーターの不足（amazon）', async () => {
        const response = await signin({ service: 'amazon' }, { id: 'session-id', version: 7 }, 'backend.mythrowaway.net', 'test');
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.Location, URL_400);
    });
    afterEach(() => {
        getDataBySigninId.restore();
        requestAmazonProfile.restore();
        requestGoogleProfile.restore();
    });
    after(() => {
        saveSession.restore();
    })
})
describe('google_signin', () => {
    const google_signin = index.__get__('google_signin');
    const saveSession = new StubModule(index, 'saveSession');
    before(() => {
        saveSession.set(async (session) => { return session });
    });
    it('正常リクエスト', async () => {
        process.env.GOOGLE_CLIENT_ID = 'clientId';
        const generateState = index.__get__('generateState');
        index.__set__('generateState', () => { return 'statevalue' });
        try {
            //パラメータはセッション情報とドメインとリクエストパス中のstage
            const response = await google_signin({ id: 'hogehoge' },'backend.mythrowaway.net','v2');
            assert.equal(response.statusCode, 301);
            assert.equal(response.headers.Location, 'https://accounts.google.com/o/oauth2/v2/auth?client_id=clientId&response_type=code&scope=openid profile&redirect_uri=https://backend.mythrowaway.net/v2/signin?service=google&state=statevalue&login_hint=mythrowaway.net@gmail.com&nonce=statevalue');
            assert.equal(response.headers['Cache-Control'], 'no-store');
        } finally {
            index.__set__('generateState', generateState);
        }
    });
    after(() => {
        saveSession.restore();
    })
});
describe('oauth_request', () => {
    const oauth_request = index.__get__('oauth_request');
    const saveSession = new StubModule(index, 'saveSession');

    before(() => {
        // eslint-disable-next-line no-unused-vars
        saveSession.set(async (session) => { return true; });
    });
    it('セッションID新規発行', async () => {
        // パラメータはqueryStringParameters,セッション情報,セッション新規発行フラグ
        const response = await oauth_request({
            state: '123456',
            client_id: 'alexa-skill',
            redirect_uri: 'https://xxxx.com',
            platform: 'amazon',
            version: '5'
        }, { id: 'hogehoge', expire: 99999999 }, true);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, 'https://accountlink.mythrowaway.net/v5/index.html');
        assert.equal(headers['Set-Cookie'], 'throwaway-session=hogehoge;max-age=3600;');
    });
    it('有効なセッションIDがすでにある場合', async () => {
        const getSssion = index.__get__('getSession');
        // eslint-disable-next-line no-unused-vars
        index.__set__('getSession', (sessionId) => { return { id: 'hogehoge', expire: 9999999999 } })
        try {
            const response = await oauth_request({
                state: '123456',
                client_id: 'alexa-skill',
                redirect_uri: 'https://xxxx.com',
                platform: 'amazon',
                version: '5'
            }, { id: 'hogehoge', expire: 99999999 }, false);
            assert.equal(response.statusCode, 301);
            const headers = response.headers;
            assert.equal(headers.Location, 'https://accountlink.mythrowaway.net/v5/index.html');
            assert.equal(headers['Set-Cookie'], undefined);
        } finally {
            index.__set__('getSession', getSssion);
        }
    });
    it('missing state', async () => {
        const response = await oauth_request({
            client_id: 'alexa-skill',
            redirect_uri: 'https://xxxx.com',
            platform: 'amazon',
            version: '5'
        });
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    }, {}, true);
    it('missing client_id', async () => {
        const response = await oauth_request({
            state: 'xxxxxx',
            redirect_uri: 'https://xxxx.com',
            platform: 'amazon',
            version: '5'
        }, {}, true);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    });
    it('missing redirect_uri', async () => {
        const response = await oauth_request({
            state: 'xxxxxx',
            client_id: 'alexa-skill',
            platform: 'amazon',
            version: '5'
        }, {}, false);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    });
    it('missing platform', async () => {
        const response = await oauth_request({
            state: 'xxxxxx',
            client_id: 'alexa-skill',
            redirect_uri: 'https://xxxx.com',
            version: '5'
        }, {}, false);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    });
    it('missing version', async () => {
        const response = await oauth_request({
            state: 'xxxxxx',
            client_id: 'alexa-skill',
            redirect_uri: 'https://xxxx.com',
            platform: 'amazon'
        }, {}, false);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    });
    it('missing all parameter', async () => {
        const response = await oauth_request(undefined, undefined, false);
        assert.equal(response.statusCode, 301);
        const headers = response.headers;
        assert.equal(headers.Location, URL_400);
    });
    after(() => {
        saveSession.restore();
    })
});