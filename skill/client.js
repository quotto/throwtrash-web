"use strict";

const AWS = require('aws-sdk')
const request = require('request')

const url='https://api.twitter.com/1.1/statuses/update.json'

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

var credential = new AWS.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null)
const dynamoClient = new AWS.DynamoDB.DocumentClient({
    region:'ap-northeast-1',
    apiVersion: '2012-08-10',
    credentials: credential
})

exports.getEnableTrashes = (access_token) => {
    return new Promise((resolve,reject) => {
        var params = {
            TableName: 'TrashSchedule',
            Key: {
                id: access_token
            }
        }
        dynamoClient.get(params,(err,data)=>{
            if(err) {
                console.log("[ERROR] DB Access Error")
                console.log(err)
                reject("情報の取得に失敗しました。スキル開発者にお問い合わせください。")
            } else if(typeof(data["Item"])==="undefined") {
                console.log("[ERROR] User Not Found")
                reject("登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。")
            } else {
                const result = check_schedule(data)
                console.log(`[INFO] Sucess Check Schedule（${access_token}）`)
                resolve(result)
            }
        })
    })
}

const check_schedule = (data)=>{
    const result = []
    const dt = calculateJSTTime()
    const trashes = JSON.parse(data['Item']['description'])
    trashes.forEach((trash,index,arr) => {
        const type =  trash['type']
        trash['schedules'].some((schedule)=>{
            if(schedule['type'] === 'weekday') {
                if(Number(schedule['value']) === dt.getDay()) {
                    result.push(type)
                    return true
                }
            } else if(schedule['type'] === 'biweek') {
                var matches = schedule['value'].match(/(\d)-(\d)/)
                var weekday = matches[1]
                var turn = matches[2]

                // 現在何週目かを求める
                var nowturn = 0
                var targetdate = dt.getDate()
                while(targetdate > 0) {
                    nowturn += 1
                    targetdate -= 7
                }

                if(Number(weekday) === dt.getDay() && Number(turn) === nowturn) {
                    result.push(type)
                    return true
                }
            } else if(schedule['type'] === 'month') {
                if(dt.getDate() === Number(schedule['value'])) {
                    result.push(type)
                    return true
                }
            }
        })
    })
    return result.filter((value,index,self)=>{
        return self.indexOf(value)===index
    })
}

const calculateJSTTime = () => {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    var dt = new Date(jsttime);
    return dt;
}
