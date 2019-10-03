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
args.option('mode', 'production or debug', 'production');
args.option('level', 'logger level', 'info');
args.option('port', 'listening port', 8888);
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
        logger.debug('create new id request:');
        const result = await dynamoClient.get({
            TableName: 'TrashSchedule',
            Key: {
                id: user_id
            }
        }).promise();
        logger.debug(result);
        if(!result.Item) {
            logger.debug('create new id:', user_id);
            break;  
        }
        retry++;
    }
    return user_id;
};

const getIdBySignId = (signinId)=>{
    const params = {
        TableName: 'TrashSchedule',
        IndexName: 'signinId-index',
        ExpressionAttributeNames: { '#i': 'signinId' } ,
        ExpressionAttributeValues: { ':val': signinId },
        KeyConditionExpression: '#i = :val'
    };
    return dynamoClient.query(params).promise().then(data => {
        logger.debug(data);
        if(data.Items.length > 0) {
            return {id: data.Items[0].id, preset: JSON.parse(data.Items[0].description)};
        }
        return {};
    }).catch(err=>{
        logger.error(err);
        return {};
    });
};

const requestAmazonProfile = async(access_token)=>{
    return rp({
        uri: 'https://api.amazon.com/user/profile',
        qs: {
            access_token: access_token
        },
        resolveWithFullResponse: true,
        json: true
    }).then(response => {
        logger.debug(JSON.stringify(response));
        if (response.statusCode === 200) {
            return {id: response.body.user_id, name: response.body.name};
        }
        Promise.reject(response);
    }).catch(err=>{
        logger.error(err);
    });
};

const requestGoogleProfile = async(code)=>{
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
            logger.debug(decoded_token);
            return {id: decoded_token.sub, name: decoded_token.name};
        } else {
            Promise.reject(response);
        }
    }).catch(err=>{
        logger.error(err);
    });
};

const generateState = (length)=>{
    let state = '';
    for(let i=0; i<length; i++) {
        state += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*35)];
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
    logger.info( 'server is starting on ' + server.address().port + ',run level:' + argv.level + ',mode: ' + argv.mode + ' ...' );
});

app.use('/', express.static('./public'));

app.get('/index/:version/:lang',(req,res)=>{
    const lang = req.params.lang;
    if(MetaInfo[lang]) {
        const bundle_path = argv.mode === 'production' ? 
            `https://d29p8bq9xwgr82.cloudfront.net/bundle/${req.params.version}.js` : `/${req.params.version}.js`;
        res.charset = 'utf-8';
        res.header('Content-Type', 'text/html;charset=utf-8');
        res.status(200);
        res.render('index',{
            lang: lang,
            title: MetaInfo[lang].title,
            bundle_path: bundle_path
        });
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
        res.redirect(`/index/v${req.session.version}/${lang}`);
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
        scope:'openid profile',
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
    let get_profile_task = null;
    if (req.query.service === 'amazon') {
        const access_token = req.query.access_token;
        if (access_token) {
            get_profile_task = requestAmazonProfile(access_token);
        }
    } else if(req.query.service === 'google') {
        const code = req.query.code;
        if((req.query.state === req.session.googleState) && code) {
            get_profile_task = requestGoogleProfile(code);
        }
    } 
    
    if(get_profile_task === null) {
        logger.error('invalid request');
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }

    get_profile_task.then(user_info=>{
        req.session.userInfo = { 
            signinId: user_info.id,
            name: user_info.name,
            signinService: req.query.service
        };
        return getIdBySignId(user_info.id);
    }).then(data=>{
        if(data.id) {
            req.session.userInfo.id = data.id;
            req.session.userInfo.preset = data.preset;
        } else {
            req.session.userInfo.preset = [];
        }
        res.redirect(`/index/v${req.session.version}/${req.acceptsLanguages(['en','ja'])}`);
    }).catch(err=>{
        logger.errpr(err);
        errorRedirect(res, 500, 'エラーが発生しました');
    });
});

app.get('/signout', (req,res)=>{
    if(req.session.userInfo) {
        logger.info('signout:'+req.session.userInfo.signinId);
        req.session.userInfo = undefined;
        res.json({message:'success signout'});
        return;
    }
    logger.warn('not signed in user');
    res.status(401).send('not signed in.');
});

app.get('/user_info', (req,res)=>{
    if(req.session.userInfo) {
        res.status(200).json({ name: req.session.userInfo.name, preset: req.session.userInfo.preset  });
        return;
    }
    logger.warn('not signed in user');
    res.status(401).json({message: 'Unauthorized'});
});

app.post('/regist',(req,res)=>{
    logger.debug('Regist request:',JSON.stringify(req.body));
    const recv_data = req.body;
    if(common_check.exist_error(recv_data)) {
        logger.error(`Bad Data\n${recv_data}`);
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }

    // 検証した登録データをセッションに格納
    const regist_data = Util.adjustData(recv_data);
    req.session.regist_data = regist_data;

    // リダイレクト元の検証用にランダム値をセッションに格納
    req.session.redirect_state = generateState(10);

    res.redirect(`/submit?redirect_state=${req.session.redirect_state}`);
});

app.get('/submit', async(req,res)=>{
    if(req.session.state && req.session.client_id && req.session.redirect_uri && req.query.redirect_state === req.session.redirect_state) {
        const item = {};
        if(req.session.userInfo) {
            item.signinId = req.session.userInfo.signinId;
            item.signinService = req.session.userInfo.signinService;
            if(req.session.userInfo.id) {
                item.id = req.session.userInfo.id;
            }
        }
        if(!item.id) {
            const user_id = await createNewId();
            if(!user_id) {
                logger.error('Failed to create Id');
                errorRedirect(res, 500, '登録に失敗しました。');
                return;
            }
            item.id = user_id;
        }

        // データ登録
        const regist_data = req.session.regist_data;
        item.description = JSON.stringify(regist_data, null, 2);
        item.platform  = req.session.platform;

        const params = {
            TableName: 'TrashSchedule',
            Item: item
        };
        logger.debug('regist parameter:',params);
        dynamoClient.put(params,(err)=>{
            if(err) {
                logger.error(`DB Insert Error\n${err}`);
                errorRedirect(res, 500, '登録に失敗しました。');
                return;
            } else {
                logger.info(`Regist user(${JSON.stringify(item)})`);
                // 登録が成功したらセッションのユーザー情報はクリアする
                req.session.userInfo = undefined;

                // Googleアシスタントの登録はfirestore登録後にリダイレクトする
                if (req.session.platform === 'google') {
                    logger.debug(`regist firestore: ${item.id},${regist_data}`);
                    firestore.runTransaction(t => {
                        const params = {
                            id: item.id,
                            data: regist_data
                        };
                        t.set(firestore.collection('schedule').doc(item.id), params);
                        return Promise.resolve('Regist Complelete');
                    }).then(() => {
                        logger.info(`Regist user(${item.id}\n${JSON.stringify(regist_data)})`);
                        const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${item.id}&client_id=${req.session.client_id}&token_type=Bearer`;
                        logger.debug(redirect_url);
                        res.status(200).end(redirect_url);
                    }).catch(err => {
                        logger.error(`DB Insert Error\n${err}`);
                        errorRedirect(res, 500, '登録に失敗しました。');
                        return;
                    });
                }  else {
                    const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${item.id}&client_id=${req.session.client_id}&token_type=Bearer`;
                    logger.debug(redirect_url);
                    res.status(200).end(redirect_url);
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
