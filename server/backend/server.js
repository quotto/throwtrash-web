const http = require( 'http' );
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const rp = require('request-promise');
const Util = require('./utility.js');
const common_check = require('../common_check.js');
const firebase_admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const MetaInfo = require('./public/meta.json');
const CONFIG = require('./config.json');

const args = require('args');
args.option('level', 'logger level', 'info');
args.option('port', 'listening port', 8888);
args.option('trash_api_endpoint', 'Data Api URL');
const argv = args.parse(process.argv);

const log4js = require('log4js');
log4js.configure({
    appenders: {
        file:{
            type: 'file',
            filename: 'server.log',
            encoding: 'utf-8',
            flags: 'a+'
        },
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: {appenders: ['file', 'out'], level: argv.level}
    }
});
const logger = log4js.getLogger();

const lineOauth_endpoint = 'https://todays-trash.herokuapp.com/oauth/request_token';
const trashApi_endpoint = argv.trash_api_endpoint || CONFIG.api.endpoint; 

const errorRedirect = (res, code, message)=>{
    res.set('Content-Type', 'text/plain;charset=utf-8');
    res.status(code).end(message);
};

const createNewId = async()=>{
    let user_id = null;
    // 初回登録は最大5回まで重複のないIDの採番を試みる
    let retry = 0;
    while(!user_id || retry < 5) {
        user_id = Util.create_id();
        const option = {
            uri: `${trashApi_endpoint}/data`,
            method: 'GET',
            qs: {
                id: user_id
            },
            headers: {
                'x-api-key': CONFIG.api.token
            }
        };
        logger.debug('create new id request:', option);
        const response = await rp(option);
        logger.debug(response);
        if(response === '') {
            logger.debug('create new id:', user_id);
            break;  
        }
        retry++;
    }
    return user_id;
};

const getIdFromLineId = async(platform, lineId)=>{
    let user_id = null;
    const option = {
        uri: `${trashApi_endpoint}/data`,
        method: 'GET',
        qs: {
            lineId: lineId
        },
        headers: {
            'x-api-key': CONFIG.api.token
        }
    };
    logger.debug('get id from lineId request', option);
    const response = await rp(option);
    const body = JSON.parse(response);
    // 登録済みデータがある場合はidを再利用してUPDATE
    if (body.length > 0) {
        user_id = body[0].id;
        logger.debug('get id from lineId:', user_id);
    }
    return user_id;
};

const generateState = (length)=>{
    let state = '';
    for(let i=0; i<length; i++) {
        state += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*35)]
    }
    return state;
};

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({secret: CONFIG.base.secret, cookie:{maxAge: 15*60*1000}})); // セッションの期限は15分間 
app.set('views','./public');
app.set('view engine','ejs');

let credential = new aws.Credentials(CONFIG.db.access_token, CONFIG.db.secret,null);
const dynamoClient = new aws.DynamoDB.DocumentClient({
    region: CONFIG.db.region,
    apiVersion: '2012-08-10',
    credentials: credential
});

let serviceAccount = require('./serviceAccountKey.json');
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount)
});

let firestore = firebase_admin.firestore();

const server = http.createServer(app).listen(argv.port, ()=>{
    logger.info( 'server is starting on ' + server.address().port + ',run level:' + argv.level + ' ...' );
});

app.use('/', express.static('./public'));

app.get('/index/:version/:lang',(req,res)=>{
    const lang = req.params.lang;
    //テスト用
    req.session.version = req.params.version;
    if(MetaInfo[lang]) {
        // ユーザー側にsigninフラグが存在した場合を考慮してセッション上にsigninIdが無ければcookieをクリアする
        req.session.signinId ? res.cookie('signing', true) : res.clearCookie('signing');
        res.charset = 'utf-8';
        res.header('Content-Type', 'text/html;charset=utf-8');
        res.status(200);
        res.render(`${req.params.version}/index`,{lang: lang,title: MetaInfo[lang].title});
    } else {
        logger.warn('Wrong lang');
        errorRedirect(res,400,'お使いの言語には対応していません');
    }
});

app.get(/oauth\/request_token(\/ || \?).*/,(req,res)=>{
    req.session.state = req.query.state;
    req.session.client_id = req.query.client_id;
    req.session.redirect_uri = req.query.redirect_uri;
    req.session.platform = req.query.platform || 'amazon';
    req.session.version = req.query.version;

    if(req.session.state && req.session.client_id && req.session.redirect_uri && req.session.version) {
        logger.info(`oauth request - platform:${req.session.platform}`);
        const lang = req.acceptsLanguages('en','ja');
        res.redirect(`/index/${req.session.version}/${lang}`);
        return;
    } else {
        logger.error('oauth reqeust session state is not match.');
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }
});

// Google-Signin用のリダイレクトパス
app.get('/oauth_signin', (req, res)=>{
    const endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    req.session.googleState = generateState(16);
    const option = {
        client_id: CONFIG.google.client_id,
        response_type:'code',
        scope:'openid email',
        redirect_uri:`${CONFIG.base.endpoint}/signin?service=google`,
        state: req.session.googleState,
        login_hint: 'mythrowaway.net@gmail.com',
        nonce: new Date().toISOString()
    };
    const params_array = [];
    for(let [key, value] of Object.entries(option)) {
        params_array.push(`${key}=${value}`);
    }
    res.redirect(endpoint+'?'+params_array.join('&'));
});

app.get('/signin', (req,res)=>{
    if (req.query.service === 'amazon') {
        const access_token = req.query.access_token;
        if (access_token) {
            return rp({
                uri: 'https://api.amazon.com/user/profile',
                qs: {
                    access_token: access_token
                },
                resolveWithFullResponse: true,
                json: true
            }).then(response => {
                logger.debug(JSON.stringify(response));
                if (response.statusCode === 200 && req.session.version) {
                    const user_id = response.body.user_id;
                    res.cookie('signing', true);
                    req.session.signinId = user_id;
                    res.redirect(`/index/${req.session.version}/${req.acceptsLanguages('en', 'ja')}`);
                } else {
                    Promise.reject(response);
                }
            }).catch(err => {
                logger.error(err);
                errorRedirect(res, 500, 'エラーが発生しました');
            });
        }
    } else if(req.query.service === 'google') {
        const code = req.query.code;
        if((req.query.state === req.session.googleState) && code) {
            const options = {
                uri: 'https://oauth2.googleapis.com/token',
                method: 'POST',
                body: {
                    code: code,
                    client_id: CONFIG.google.client_id,
                    client_secret: CONFIG.google.client_secret,
                    redirect_uri: `${CONFIG.base.endpoint}/signin?service=google`,
                    grant_type: 'authorization_code'
                },
                json: true
            };
            return rp(options).then(response=>{
                if(response.id_token) {
                    const decoded_token = jwt.decode(response.id_token);
                    res.cookie('signing', true);
                    req.session.signinId = decoded_token.sub;
                    res.redirect(`/index/${req.session.version}/${req.acceptsLanguages('en', 'ja')}`);
                } else {
                    Promise.reject(response);
                }
            }).catch(err=>{
                logger.error(err);
                errorRedirect(res, 500, 'エラーが発生しました');
            });
        }
    }
    logger.error('invalid request');
    errorRedirect(res, 400, '不正なリクエストです');
});

app.post('/regist',(req,res)=>{
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        logger.debug('Regist request:',req.body);
        const recv_data = JSON.parse(req.body.data);
        if(common_check.exist_error(recv_data)) {
            logger.error(`Bad Data\n${recv_data}`);
            errorRedirect(res, 400, '不正なリクエストです');
            return;
        }

        // 検証した登録データをセッションに格納
        const regist_data = Util.adjustData(recv_data);
        req.session.regist_data = regist_data;

        // リダイレクト元の検証用にランダム値をセッションに格納
        let redirect_state  = '';
        for(let i=0; i<16; i++) {
            redirect_state += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*35)]
        }
        req.session.redirect_state = redirect_state;

        if(req.body.line) {
            res.status(200).end(`${lineOauth_endpoint}?&redirect_state=${redirect_state}&redirect_url=${process.env.LINE_OAUTH_CALLBACK}`);
        } else {
            res.status(200).end(`/submit?redirect_state=${redirect_state}`);
        }
        return;
        
    } else {
        logger.error('Bad Request');
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }
});

app.get('/submit', async(req,res)=>{
    const query = req.query;
    if(req.session.state && req.session.client_id && req.session.redirect_uri && query.redirect_state === req.session.redirect_state) {
        let user_id = null;
        const lineId = query.lineId;
        if(lineId) {
            try {
                user_id = await getIdFromLineId(req.session.platform, lineId);
            } catch(err) {
                logger.error(err);
                errorRedirect(res, 400, '登録に失敗しました。');
            }
        }

        if(!user_id) {
            user_id = await createNewId();
            if(!user_id) {
                logger.error('Failed to create Id');
                errorRedirect(res, 400, '登録に失敗しました。');
            }
        }

        // データ登録
        const regist_data = req.session.regist_data;
        const item = {
            id: user_id,
            description: JSON.stringify(regist_data, null, 2),
            platform: req.session.platform
        };
        if (lineId) {
            item.lineId = lineId;
            item.remind = true;
        }
        const params = {
            TableName: 'TrashSchedule',
            Item: item
        };
        logger.debug('regist parameter:',params);
        dynamoClient.put(params,(err,data)=>{
            if(err) {
                logger.error(`DB Insert Error\n${err}`);
                errorRedirect(res, 400, '登録に失敗しました。');
                return;
            } else {
                logger.info(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`);
                // Googleアシスタントからの登録はfirestore登録後にリダイレクトする
                if (req.session.platform === 'google') {
                    logger.debug(`regist firestore: ${user_id},${regist_data}`);
                    firestore.runTransaction(t => {
                        const params = {
                            id: user_id,
                            data: regist_data
                        };
                        if (lineId) {
                            params.lineId = lineId;
                            params.remind = true;
                        }
                        t.set(firestore.collection('schedule').doc(user_id), params);
                        return Promise.resolve('Regist Complelete');
                    }).then(() => {
                        logger.info(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`);
                        const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                        logger.debug(redirect_url);
                        res.redirect(redirect_url);
                    }).catch(err => {
                        logger.error(`DB Insert Error\n${err}`);
                        errorRedirect(res, 400, '登録に失敗しました。');
                        return;
                    });
                }  else {
                    const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                    logger.debug(redirect_url);
                    res.redirect(redirect_url);
                    return;
                }
            }
        });


    } else {
        logger.error('submit session state is not match.');
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }
});
