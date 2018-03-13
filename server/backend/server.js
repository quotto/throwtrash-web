const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const aws = require('aws-sdk')
const bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const express = require('express')
const OAuth = require('oauth').OAuth
const Twitter = require('twitter')
const Util = require('./utility.js')

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

const CONSUMER_KEY=process.env.TWITTER_CONSUMER_KEY
const CONSUMER_SECRET=process.env.TWITTER_CONSUMER_SECRET
var server = app.listen(3000,()=>{
    console.log(`ServerStart ${server.address().port}`)
})


app.get(/.+\..+/,(req,res,next)=>{
    let requestPath = url.parse(req.url).pathname;
    console.log(`->${req.method} ${requestPath}`);

    let sendResource = path.join('../public',requestPath)
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
    var oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      CONSUMER_KEY,
      CONSUMER_SECRET,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    oauth.getOAuthRequestToken((error,oauth_token,oauth_token_secret,results)=>{
        if(error){
            console.log("RequestTokenError!:")
            console.log(error)
        }else {
            req.session.oauth = oauth
            req.session.oauth_token = oauth_token
            req.session.oauth_token_secret = oauth_token_secret
            res.redirect(`https://twitter.com/oauth/authenticate?oauth_token=${oauth_token}`)
        }
    })
});

app.get('/oauth/callback',(req,res)=>{
    var oauth = new OAuth(
        req.session.oauth._requestUrl,
        req.session.oauth._accessUrl,
        req.session.oauth._consumerKey,
        req.session.oauth_consumerSecret,
        req.session.oauth_version,
        req.session.oauth._authorize_callback,
        req.session.oauth._signatureMethod
    );
    console.log(oauth)
    oauth.getOAuthAccessToken(
        req.session.oauth_token,
        req.session.oauth_token_secret,
        req.param('oauth_verifier'),
        (error,oauth_access_token,oauth_access_token_secret,results2)=>{
            if(error) {
                console.log("oauthAccessToken Error!:")
                console.log(error)
            } else {
                req.session.oauth_access_token = oauth_access_token
                req.session.oauth_access_token_secret = oauth_access_token_secret
                console.log("Success OAuth:")
                console.log(oauth_access_token)
                console.log(oauth_access_token_secret)
                res.redirect('/index.html')
            }
        }
    )
})

app.post("/trashes",(req,res)=> {
    // DBのキーとするためTwitterのidを取得する
    console.log(req.body)
    var access_token = req.body['access_token']
    var access_token_secret = req.body['access_token_secret']
    console.log(access_token)
    console.log(access_token_secret)
    var client = new Twitter({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        access_token_key: access_token,
        access_token_secret: access_token_secret
    })

    client.get('account/verify_credentials.json',(error,info,tres)=>{
        if(error) {
            console.log("account error!:")
            console.log(error)
        } else {
            var twitter_id = info['id']
            var params = {
                TableName: 'TrashSchedule',
                Key: {
                    id: twitter_id.toString()
                }
            }
            dynamoClient.get(params,(err,data)=>{
                if(err) {
                    console.log("DB get error")
                    console.log(err)
                } else {
                    console.log(data)
                    var result = Util.check_schedule(data['Item']['description'])
                    console.log(result)
                    res.status(200).end(JSON.stringify({result:result}))
                }
            })
        }
    })
})

app.post("/regist",(req,res,next)=>{
    res.setHeader('Content-Type', 'text/plain')
    console.log(JSON.stringify(req.body,null,2))

    // DBのキーとするためTwitterのidを取得する
    var access_token = req.session.oauth_access_token
    var access_token_secret = req.session.oauth_access_token_secret
    var client = new Twitter({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        access_token_key: access_token,
        access_token_secret: access_token_secret
    })

    client.get('account/verify_credentials.json',(error,info,tres)=>{
        if(error) {
            console.log("verify error!:")
            console.log(error)
            res.status(500).end("verify error")
        } else {
            var id = info['id']
            var item = {
                id: id.toString(),
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
                    res.send("success")
                    res.status(200).end()
                }
            })
        }
    })
})
