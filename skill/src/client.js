'use strict';

const AWS = require('aws-sdk');

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

const TrashType = {
    burn : 'もえるゴミ',
    unburn: 'もえないゴミ',
    plastic: 'プラスチック',
    bottole: 'ビン<break time="1ms"/>カン',
    bin: 'ビン',
    can: 'カン',
    petbottle: 'ペットボトル',
    paper: '古紙',
    resource: '<say-as interpret-as="interjection">資源ゴミ</say-as>',
    coarse: '<say-as interpret-as="interjection">粗大ゴミ</say-as>'
};


var credential = new AWS.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null);
const dynamoClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_DYNAMO_REGION,
    apiVersion: '2012-08-10',
    credentials: credential
});

/**
target_day: 対象とする日を特定するための値。0なら今日、1なら明日……となる。
**/
const calculateJSTTime = (target_day) => {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset + (60 * 24 * 60 * 1000 * target_day);
    var dt = new Date(jsttime);
    return dt;
};

/**
曜日指定の取得
現在の曜日と指定の曜日からtarget_dayを算出してgetEnableTrashesを呼び出す
access_token: ユーザーを特定するためのuuid
weekday: 指定された曜日 0=日曜日 始まり
**/
exports.getEnableTrashesByWeekday = function(access_token,target_weekday) {
    const dt = calculateJSTTime(0);
    const now_weekday = dt.getDay();
    let target_day = target_weekday - now_weekday;
    //1より小さい場合は翌週分
    if(target_day < 1) {
        target_day += 7;
    }
    return this.getEnableTrashes(access_token,target_day);
};

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
        };
        dynamoClient.get(params,(err,data)=>{
            if(err) {
                console.log('[ERROR] DB Access Error');
                console.log(err);
                reject('情報の取得に失敗しました。スキル開発者にお問い合わせください。');
            } else if(typeof(data['Item'])==='undefined') {
                console.log(`[ERROR] User Not Found => ${access_token}`);
                reject('登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。');
            } else {
                const result = get_enable_trashes(data,target_day);
                console.log(`[INFO] Sucess Check Schedule（${access_token}）`);
                resolve(result);
            }
        });
    });
};

/**
data:   DynamoDBから取得したJSON形式のパラメータ。
        {"Item":["description":'[...]']}
        の形式。
target_day: チェックするn日目。0なら今日、1なら明日......
**/
const get_enable_trashes = (data,target_day)=>{
    const result = [];
    const dt = calculateJSTTime(target_day);
    const trashes = JSON.parse(data['Item']['description']);
    trashes.forEach((trash,index,arr) => {
        const trash_name = trash['type'] ==='other' ? trash['trash_val'] : TrashType[trash['type']];
        // const type =  trash['type']
        trash['schedules'].some((schedule)=>{
            if(schedule['type'] === 'weekday') {
                console.log(dt);;
                if(Number(schedule['value']) === dt.getDay()) {
                    result.push(trash_name);
                    return true;
                }
            } else if(schedule['type'] === 'biweek') {
                var matches = schedule['value'].match(/(\d)-(\d)/);
                var weekday = matches[1];
                var turn = matches[2];

                // 現在何週目かを求める
                var nowturn = 0;
                var targetdate = dt.getDate();
                while(targetdate > 0) {
                    nowturn += 1;
                    targetdate -= 7;
                }

                if(Number(weekday) === dt.getDay() && Number(turn) === nowturn) {
                    result.push(trash_name);
                    return true;
                }
            } else if(schedule['type'] === 'month') {
                if(dt.getDate() === Number(schedule['value'])) {
                    result.push(trash_name);
                    return true;
                }
            } else if(schedule['type'] === 'evweek') {
                if(Number(schedule.value.weekday) === dt.getDay()) {
                    const start_dt = new Date(schedule.value.start);
                    start_dt.setHours(0);
                    start_dt.setMinutes(0);
                    start_dt.setSeconds(0);
                    start_dt.setMilliseconds(0);
                    console.log(start_dt);

                    // 今週の日曜日を求める
                    let current_dt = new Date(dt.toISOString());
                    current_dt.setHours(0);
                    current_dt.setMinutes(0);
                    current_dt.setSeconds(0);
                    current_dt.setMilliseconds(0);
                    current_dt.setDate(current_dt.getDate() - current_dt.getDay());
                    console.log(current_dt);

                    // 登録されている日付からの経過日数を求める
                    const past_date = (current_dt - start_dt) / 1000 / 60 / 60 / 24;
                    console.log(past_date);

                    // 差が0またはあまりが0であれば隔週に該当
                    if(past_date === 0 || (past_date / 7) % 2 === 0) {
                        result.push(trash_name);
                        return true;
                    }
                }
            }
        });
    });
    // 同名のゴミがあった場合に重複を排除する
    return result.filter((value,index,self)=>{
        return self.indexOf(value) === index;
    });
};
