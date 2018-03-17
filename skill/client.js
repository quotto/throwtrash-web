"use strict";

const AWS = require('aws-sdk')
const request = require('request')

const url='https://api.twitter.com/1.1/statuses/update.json'

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

exports.getEnableTrashes = (access_token) => {
    return new Promise((resolve,reject) => {
        const params = {
            user_id: access_token
        }

        const options = {
            url: `https://${process.env.TRASHES_SERVER}/trashes`,
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(params)
        };
        request.post(options ,(error,response,body) => {
            if(error) {
                console.log("error:"+error)
                reject("問題が発生しました。スキルの開発者にお問い合わせください。")
            } else if(response.statusCode!=200) {
                console.log("bad status:"+body)
                reject(body)
            } else {
                const result = check_schedule(body)
                resolve(result)
            }
        })
    })
}

const check_schedule = (data)=>{
    const result = []
    const dt = calculateJSTTime()
    const trashes = JSON.parse(JSON.parse(data)['Item']['description'])
    trashes.forEach((trash,index,arr) => {
        const type =  trash['type']
        console.log(`checkschedule:${type}`)
        trash['schedules'].some((schedule)=>{
            if(schedule['type'] === 'weekday') {
                if(Number(schedule['value']) === dt.getDay()) {
                    console.log(`hit weekday:${schedule['value']}`)
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
                    console.log(`hit biweek:${schedule['value']}`)
                    result.push(type)
                    return true
                }
            } else if(schedule['type'] === 'month') {
                if(dt.getDate() === Number(schedule['value'])) {
                    console.log(`hit month:${schedule['value']}`)
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
