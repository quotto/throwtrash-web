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
    region:'ap-northeast-1',
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
    console.log( "server stating on " + server.address().port + " ..." );
});

app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    console.log(`->${req.method} ${requestPath}`);

    let sendResource = path.join('./public',requestPath)
    let sendFile = fs.createReadStream(sendResource,{encoding:'utf-8'})
    let responseData = ''
    sendFile.on("readable",()=>{
        res.set({"Content-Type":mime[path.extname(sendResource)]})
        console.log(mime[path.extname(sendResource)])
    })

    sendFile.on("data",(data)=>{
        responseData += data
    })

    sendFile.on("close",()=> {
        res.send(responseData)
        res.status(200).end()
        console.log(`<- OK:${req.method} ${sendResource}`)
    })

    sendFile.on("error",(err)=>{
        console.log(`<- Error:${req.method} ${requestPath}`)
    })
})

app.get('/oauth/request_token',(req,res)=>{
    req.session.state = req.query.state
    req.session.client_id = req.query.client_id
    req.session.vendor_id = req.query.vendor_id
    req.session.redirect_uri = req.query.redirect_uri

    res.redirect('/index.html')
});

app.post("/trashes",(req,res)=> {
    var user_id = req.body['user_id']
    var params = {
        TableName: 'TrashSchedule',
        Key: {
            id: user_id
        }
    }
    dynamoClient.get(params,(err,data)=>{
        if(err) {
            console.log("DB get error")
            console.log(err)
            res.status(500).end("情報の取得に失敗しました。スキル開発者にお問い合わせください。")
        } else {
            console.log(data)
            res.status(200).end(JSON.stringify(data))
        }
    })
})

app.post("/regist",(req,res,next)=>{
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
            console.log(err)
            res.status(500).end("registraion error")
        } else {
            const redirect_url = `${req.session.redirect_uri}#state=${req.session.state}&access_token=${user_id}&client_id=${req.session.client_id}&token_type=Bearer`
            res.status(200).end(redirect_url)
        }
    })
})
