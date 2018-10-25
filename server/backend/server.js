const http = require( 'http' );
const fs = require('fs');
const url = require('url');
const path = require('path');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const Util = require('./utility.js');
const Logger = require('./logger.js');
const common_check = require('../common_check.js');
const firebase_admin = require('firebase-admin');

let logger = new Logger('./server.log');

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: process.env.TRASHES_SECRET}));

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


const port = process.argv[2] ? process.argv[2] : 80;
const server = http.createServer(app).listen(port, ()=>{
    logger.write( 'server is starting on ' + server.address().port + ' ...' );
});

app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    logger.write(`->${req.method} ${requestPath}`,'REQ');

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
        logger.write(`<- OK:${req.method} ${sendResource}`,'RES');
    });

    sendFile.on('error',(err)=>{
        logger.write(`<- Error:${req.method} ${requestPath}`,'ERROR');
    });
});

app.get(/oauth\/request_token(\/ || \?).*/,(req,res)=>{
    req.session.state = req.query.state;
    req.session.client_id = req.query.client_id;
    req.session.redirect_uri = req.query.redirect_uri;
    let version = req.query.version;
    //旧互換用の判定条件
    if(!version) {
        const platform_index = req.path.lastIndexOf('/');
        req.session.platform = req.path.slice(platform_index + 1);
        const version_index = req.path.lastIndexOf('/');
        version = req.path.slice(version_index - 1,platform_index);
    } else {
        req.session.platform='amazon';
    }
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        console.log(`platform:${req.session.platform}`);
        res.redirect(`/v${version}/index.html`);
    } else {
        logger.write('Bad Request','ERROR');
        res.status(400).end('bad request');
        return;
    }
});

app.post('/regist',(req,res,next)=>{
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        if(common_check.exist_error(req.body)) {
            logger.write(`Bad Data\n${req.body}`,'ERROR');
            res.status(400).end('bad request');
            return;
        }

        const user_id = Util.create_id();
        const regist_data = Util.adjustData(req.body);
        var item = {
            id: user_id,
            description: JSON.stringify(regist_data,null,2)
        };
        var params = {
            TableName: 'TrashSchedule',
            Item: item
        };
        if(req.session.platform === 'google') {
            console.log(`${user_id},${regist_data}`);
            firestore.runTransaction(t=>{
                t.set(firestore.collection('schedule').doc(user_id),
                    {
                        id: user_id,
                        data: regist_data
                    });
                return Promise.resolve('Regist Complelete');
            }).then(doc=>{
                logger.write(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`,'INFO');
                const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                console.log(redirect_url);
                res.status(200).end(redirect_url);
            }).catch(err=>{
                logger.write(`DB Insert Error\n${err}`,'ERROR');
                res.status(500).end('registraion error');
                return;
            });
        } else {
            dynamoClient.put(params,(err,data)=>{
                if(err) {
                    logger.write(`DB Insert Error\n${err}`,'ERROR');
                    res.status(500).end('registraion error');
                    return;
                } else {
                    logger.write(`Regist user(${user_id}\n${JSON.stringify(regist_data)})`,'INFO');
                    const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`;
                    console.log(redirect_url);
                    res.status(200).end(redirect_url);
                    return;
                }
            });
        }
    } else {
        logger.write('Bad Request','ERROR');
        res.status(400).end('bad request');
        return;
    }
});
