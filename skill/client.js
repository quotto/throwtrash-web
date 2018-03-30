"use strict";

const AWS = require('aws-sdk')
const request = require('request')

const url='https://api.twitter.com/1.1/statuses/update.json'

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

var credential = new AWS.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null)
const dynamoClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_DYNAMO_REGION,
    apiVersion: '2012-08-10',
    credentials: credential
})

/**
target_day: 対象とする日を特定するための値。0なら今日、1なら明日……となる。
**/
exports.calculateJSTTime = (target_day) => {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset + (60 * 24 * 60 * 1000 * target_day);
    var dt = new Date(jsttime);
    return dt;
}

/**
曜日指定の取得
現在の曜日と指定の曜日からtarget_dayを算出してgetEnableTrashesを呼び出す
access_token: ユーザーを特定するためのuuid
weekday: 指定された曜日 0=日曜日 始まり
**/
exports.getEnableTrashesByWeekday = (access_token,target_weekday) => {
    const dt = this.calculateJSTTime(0)
    const now_weekday = dt.getDay()
    let target_day = target_weekday - now_weekday
    //1より小さい場合は翌週分
    if(target_day < 1) {
        target_day += 7
    }
    return this.getEnableTrashes(access_token,target_day)
}

/**
access_token: ユーザーを特定するためのuuid
target_day: 0:今日,1:明日
**/
exports.getEnableTrashes = (access_token,target_day) => {
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
                const result = this.check_schedule(data,target_day)
                console.log(`[INFO] Sucess Check Schedule（${access_token}）`)
                resolve(result)
            }
        })
    })
}

/**
data:   DynamoDBから取得したJSON形式のパラメータ。
        {"Item":["description":'[...]']}
        の形式。
target_day: チェックするn日目。0なら今日、1なら明日......
**/
exports.check_schedule = (data,target_day)=>{
    const result = []
    const dt = this.calculateJSTTime(target_day)
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
