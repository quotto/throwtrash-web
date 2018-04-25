const http = require('http')
const https = require( 'https' )
const fs = require('fs')
const url = require('url')
const path = require('path')
const aws = require('aws-sdk')
const bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const express = require('express')
const Util = require('./utility.js')
const Logger = require('./logger.js')

var logger = new Logger('./server.log')

//. 鍵ファイルと証明書ファイル
var options = {
    key: fs.readFileSync( './certs/server_key.pem' ),
    cert: fs.readFileSync( './certs/server.crt' )
};

var app = express()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use(cookieParser())
app.use(session({secret: process.env.TRASHES_SECRET}))

var credential = new aws.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null)
const dynamoClient = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_DYNAMO_REGION,
    apiVersion: '2012-08-10',
    credentials: credential
})

var mime = {
    '.html':'text/html',
    '.css':'text/css',
    '.js':'application/javascript'
}

//. 鍵ファイルと証明書ファイルを指定して、https で待受け
const port = process.argv[2] ? process.argv[2] : 443
const server = https.createServer( options, app ).listen(port, ()=>{
    logger.write( "server is starting on " + server.address().port + " ..." )
});

app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    logger.write(`->${req.method} ${requestPath}`,"REQ")

    let sendResource = path.join('./public',requestPath)
    let sendFile = fs.createReadStream(sendResource,{encoding:'utf-8'})
    let responseData = ''
    sendFile.on("readable",()=>{
        res.set({"Content-Type":mime[path.extname(sendResource)]})
    })

    sendFile.on("data",(data)=>{
        responseData += data
    })

    sendFile.on("close",()=> {
        res.send(responseData)
        res.status(200).end()
        logger.write(`<- OK:${req.method} ${sendResource}`,"RES")
    })

    sendFile.on("error",(err)=>{
        logger.write(`<- Error:${req.method} ${requestPath}`,"ERROR")
    })
})

app.get('/oauth/request_token',(req,res)=>{
    req.session.state = req.query.state
    req.session.client_id = req.query.client_id
    req.session.redirect_uri = req.query.redirect_uri
    const version=req.query.version
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        if(version) {
            res.redirect(`/v${version}/index.html`)
        } else {
            res.redirect('/index.html')
        }
    } else {
        logger.write("Bad Request","ERROR")
        res.status(400).end("bad request")
        return
    }
});

app.post("/regist",(req,res,next)=>{
    if(req.session.state && req.session.client_id && req.session.redirect_uri) {
        const user_id = Util.create_id()
        var item = {
            id: user_id,
            description: JSON.stringify(req.body,null,2)
        }
        var params = {
            TableName: 'TrashSchedule',
            Item: item
        }
        dynamoClient.put(params,(err,data)=>{
            if(err) {
                logger.write(`DB Insert Error\n${err}`,"ERROR")
                res.status(500).end("registraion error")
            } else {
                logger.write(`Regist user(${user_id}\n${JSON.stringify(req.body,null,2)})`,"INFO")
                const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`
                res.status(200).end(redirect_url)
            }
        })
    } else {
        logger.write("Bad Request","ERROR")
        res.status(400).end("bad request")
        return
    }
})
