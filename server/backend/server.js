const http = require( 'http' );
const fs = require('fs');
const url = require('url');
const path = require('path');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const rp = require('request-promise');
const Util = require('./utility.js');
const common_check = require('../common_check.js');
const firebase_admin = require('firebase-admin');
const MetaInfo = require('./public/meta.json');

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
const trashApi_endpoint = argv.trash_api_endpoint || process.env.TRASH_API_ENDPOINT; 

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
                'x-api-key': process.env.TRASH_API_TOKEN
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
            'x-api-key': process.env.TRASH_API_TOKEN
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

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({secret: process.env.TRASHES_SECRET, cookie:{maxAge: 15*60*1000}})); // セッションの期限は15分間 
app.set('views','./public');
app.set('view engine','ejs');

let credential = new aws.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null);
const dynamoClient = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_DYNAMO_REGION,
    apiVersion: '2012-08-10',
    credentials: credential
});

let serviceAccount = require('./serviceAccountKey.json');
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount)
});

let firestore = firebase_admin.firestore();

const server = http.createServer(app).listen(argv.port, ()=>{
    logger.info( 'server is starting on ' + server.address().port + ' ...' );
});

app.use('/', express.static('public'));

app.get('/index/:lang',(req,res,next)=>{
    const lang = req.params.lang;
    if(MetaInfo[lang]) {
        res.render('index',{lang: lang,title: MetaInfo[lang].title});
    } else {
        logger.warn('Wrong lang');
        errorRedirect(res,400,'お使いの言語には対応していません');
        return;
    }
});

app.get(/oauth\/request_token(\/ || \?).*/,(req,res)=>{
    req.session.state = req.query.state;
    req.session.client_id = req.query.client_id;
    req.session.redirect_uri = req.query.redirect_uri;
    req.session.platform = req.query.platform || 'amazon';

    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        logger.info(`oauth request - platform:${req.session.platform}`);
        const lang = req.acceptsLanguages('en','ja');
        res.redirect(`/index/${lang}`);
    } else {
        logger.error('oauth reqeust session state is not match.');
        errorRedirect(res, 400, '不正なリクエストです');
        return;
    }
});

app.post('/regist',(req,res,next)=>{
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
