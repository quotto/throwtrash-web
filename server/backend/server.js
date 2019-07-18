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
const trashApi_endpoint = 'https://o8a8597lm0.execute-api.ap-northeast-1.amazonaws.com/test';

const createNewId = async(platform)=>{
    let user_id = null;
    // 初回登録は最大5回まで重複のないIDの採番を試みる
    let retry = 0;
    while(!user_id || retry < 5) {
        user_id = Util.create_id();
        const option = {
            uri: `${trashApi_endpoint}/data`,
            method: 'GET',
            qs: {
                platform: platform,
                id: user_id
            },
            headers: {
                'x-api-key': process.env.TRASH_API_TOKEN
            }
        };
        logger.debug('create new id request:', option);
        const response = await rp(option);
        if(JSON.parse(response).length == 0) {
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
            platform: platform,
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

let mime = {
    '.html':'text/html',
    '.css':'text/css',
    '.js':'application/javascript',
    '.ico':'image/x-icon'
};


const server = http.createServer(app).listen(argv.port, ()=>{
    logger.info( 'server is starting on ' + server.address().port + ' ...' );
});

app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    logger.info(`${req.method} ${requestPath}`);

    let sendResource = path.join('./public',requestPath);
    let sendFile = fs.createReadStream(sendResource,{encoding:'utf-8'});
    let responseData = '';
    sendFile.on('readable',()=>{
        res.set({'Content-Type':mime[path.extname(sendResource)]});
    });

    sendFile.on('data',(data)=>{
        responseData += data;
    });

    sendFile.on('close',()=> {
        res.send(responseData);
        res.status(200).end();
        logger.info(`OK:${req.method} ${sendResource}`);
    });

    sendFile.on('error',(err)=>{
        logger.error(`Error:${req.method} ${requestPath}`);
    });
});

app.get('/index/:version/:lang',(req,res,next)=>{
    const lang = req.params.lang;
    if(MetaInfo[lang]) {
        res.render(`${req.params.version}/index`,{lang: lang,title: MetaInfo[lang].title});
    } else {
        logger.warn('Wrong lang','ERROR');
        res.status(400).end('bad request');
        return;
    }
});

app.get(/oauth\/request_token(\/ || \?).*/,(req,res)=>{
    req.session.state = req.query.state;
    req.session.client_id = req.query.client_id;
    req.session.redirect_uri = req.query.redirect_uri;
    req.session.platform = req.query.platform;
    let version = req.query.version;

    //旧互換用の判定条件
    if(!version) {
        // google assistant
        const platform_index = req.path.lastIndexOf('/');
        req.session.platform = req.path.slice(platform_index + 1);
        const version_index = req.path.lastIndexOf('/');
        version = req.path.slice(version_index - 1,platform_index);
    } else {
        // alexa 旧バージョン用
        req.session.platform='amazon';
    }
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        logger.info(`oauth request - platform:${req.session.platform}`);
        const lang = req.acceptsLanguages('en','ja');
        version < 5 ? res.redirect(`/v${version}/index.html`) : res.redirect(`/index/v${version}/${lang}`);
    } else {
        logger.error('Bad Request');
        res.status(400).end('bad request');
        return;
    }
});

app.post('/regist',(req,res,next)=>{
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        logger.debug('Regist request:',req.body);
        const recv_data = JSON.parse(req.body.data);
        if(common_check.exist_error(recv_data)) {
            logger.error(`Bad Data\n${recv_data}`);
            res.status(400).end('bad request');
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
            res.status(200).end(`${lineOauth_endpoint}?platform=${req.session.platform}&redirect_state=${redirect_state}`);
        } else {
            res.status(200).end(`/submit?redirect_state=${redirect_state}`);
        }
        return;
        
    } else {
        logger.error('Bad Request');
        res.status(400).end('bad request');
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
            }
        }

        if(!user_id) {
            user_id = await createNewId();
            if(!user_id) {
                logger.error('Failed to create Id');
                //TODO エラーリダイレクト
            }
        }

        const regist_data = req.session.regist_data;
        if(req.session.platform === 'google') {
            logger.debug(`regist firestore: ${user_id},${regist_data}`);
            firestore.runTransaction(t=>{
                const params = {
                    id: user_id,
                    data: regist_data
                };
                if(lineId) {
                    params.lineId = lineId;
                    params.remind = true;
                }
                t.set(firestore.collection('schedule').doc(user_id), params);
                return Promise.resolve('Regist Complelete');
            }).then(()=>{
                logger.info(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`);
                const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                logger.debug(redirect_url);
                res.redirect(redirect_url);
            }).catch(err=>{
                logger.drror(`DB Insert Error\n${err}`);
                res.status(500).end('registraion error');
                return;
            });
        } 


        const item = {
            id: user_id,
            description: JSON.stringify(regist_data, null, 2)
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
                res.status(500).end('registraion error');
                return;
            } else {
                logger.info(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`);
                const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                logger.debug(redirect_url);
                res.redirect(redirect_url);
                return;
            }
        });
    } else {
        logger.error('Bad Request');
        res.status(400).end('bad request');
        return;
    }
});
