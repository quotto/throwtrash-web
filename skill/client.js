'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');

const AWS = require('aws-sdk');

class Client {

    constructor(_locale,_timezone){
        this.locale = _locale;
        this.timezone = _timezone;
        this.localtext = require(`template_text/${this.locale}.text.json`);

        const credential = new AWS.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null);
        this.dynamoClient = new AWS.DynamoDB.DocumentClient({
            region: process.env.AWS_DYNAMO_REGION,
            apiVersion: '2012-08-10',
            credentials: credential
        });
    }

    /**
    target_day: 対象とする日を特定するための値。0なら今日、1なら明日……となる。
    **/
    calculateLocalTime(target_day) {
        const utcdt = new Date(); //UTC時刻
        const localeoffset = moment.tz.zone(this.timezone).utcOffset(utcdt.getTime());
        console.log(this.timezone,localeoffset);
        // 稼働するロケールのオフセットを差し引くことで、new Date(localtime)のロケールのオフセットを打ち消す
        const localtime = utcdt.getTime() + (utcdt.getTimezoneOffset() * 60 * 1000) + ((-1 * localeoffset) * 60 * 1000) + (60 * 24 * 60 * 1000 * target_day);
        const dt = new Date(localtime);
        return dt;
    }

    /**
    曜日指定の取得
    現在の曜日と指定の曜日からtarget_dayを算出してgetEnableTrashesを呼び出す
    access_token: ユーザーを特定するためのuuid
    weekday: 指定された曜日 0=日曜日 始まり
    **/
    getTargetDayByWeekday(target_weekday) {
        const dt = this.calculateLocalTime(0);
        const now_weekday = dt.getDay();
        let target_day = target_weekday - now_weekday;
        //1より小さい場合は翌週分
        if(target_day < 1) {
            target_day += 7;
        }
        return target_day;
    }

    /**
    access_token: ユーザーを特定するためのuuid
    target_day: 0:今日,1:明日
    **/
    getTrashData(access_token) {
        return new Promise((resolve,reject) => {
            var params = {
                TableName: 'TrashSchedule',
                Key: {
                    id: access_token
                }
            };
            this.dynamoClient.get(params,(err,data)=>{
                if(err) {
                    console.log('[ERROR] DB Access Error');
                    console.log(err);
                    reject(
                        {
                            status:'error',
                            message:this.localtext.message.error.general//'情報の取得に失敗しました。スキル開発者にお問い合わせください。'
                        }
                    );
                } else if(typeof(data['Item'])==='undefined') {
                    console.log(`[ERROR] User Not Found => ${access_token}`);
                    reject(
                        {
                            status:'error',
                            message:this.localtext.message.error.idnotfound//'登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。'
                        }
                    );
                } else {
                    resolve(
                        {
                            status:'success',
                            response:JSON.parse(data['Item']['description'])
                        }
                    );
                }
            });
        });
    }

    /**
    trashes:   DynamoDBから取得したJSON形式のパラメータ。
    target_day: チェックするn日目。0なら今日、1なら明日......
    **/
    checkEnableTrashes(trashes,target_day) {
        const result = [];
        const dt = this.calculateLocalTime(target_day);
        trashes.forEach((trash) => {
            const trash_name = trash['type'] ==='other' ? trash['trash_val'] : this.localtext.trashname[trash['type']];
            const trash_data = {
                type: trash['type'],
                trash_name: trash_name
            };
            // const type =  trash['type']
            trash['schedules'].some((schedule)=>{
                if(schedule['type'] === 'weekday') {
                    if(Number(schedule['value']) === dt.getDay()) {
                        result.push(trash_data);
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
                        result.push(trash_data);
                        return true;
                    }
                } else if(schedule['type'] === 'month') {
                    if(dt.getDate() === Number(schedule['value'])) {
                        result.push(trash_data);
                        return true;
                    }
                } else if(schedule['type'] === 'evweek') {
                    if(Number(schedule.value.weekday) === dt.getDay()) {
                        const start_dt = new Date(schedule.value.start);
                        start_dt.setHours(0);
                        start_dt.setMinutes(0);
                        start_dt.setSeconds(0);
                        start_dt.setMilliseconds(0);

                        // 今週の日曜日を求める
                        let current_dt = new Date(dt.toISOString());
                        current_dt.setHours(0);
                        current_dt.setMinutes(0);
                        current_dt.setSeconds(0);
                        current_dt.setMilliseconds(0);
                        current_dt.setDate(current_dt.getDate() - current_dt.getDay());

                        // 登録されている日付からの経過日数を求める
                        const past_date = (current_dt - start_dt) / 1000 / 60 / 60 / 24;

                        // 差が0またはあまりが0であれば隔週に該当

                        trash_data.schedule = [];
                        if(past_date === 0 || (past_date / 7) % 2 === 0) {
                            result.push(trash_data);
                            return true;
                        }
                    }
                }
            });
        });
        // 同名のゴミがあった場合に重複を排除する
        const keys = [];
        return result.filter((value)=>{
            const key = value.type+value.trash_name;
            if(keys.indexOf(key) >= 0) {
                return false;
            } else {
                keys.push(key);
                return true;
            }
        });
    }

    /*
    全てのゴミ出し予定を整形された文書データで返す
    trashes: DynamoDBから取得したJSON形式のパラメータ
    */
    getAllSchedule(trashes) {
        const return_data = [];
        trashes.forEach((trash)=>{
            const trash_data = {};
            trash_data.type = trash.type;
            trash_data.typeText = trash.type != 'other' ? this.localtext.trashname[trash.type] : trash.trash_val;

            trash_data.schedules = [];
            trash.schedules.forEach((schedule)=>{
                if(schedule.type == 'weekday') {
                    trash_data.schedules.push(`${this.localtext.schedule.weekday.replace('%s',this.localtext.weekday[schedule.value])}`);
                } else if(schedule.type == 'biweek') {
                    const matches = schedule.value.match(/(\d)-(\d)/);
                    const weekday = matches[1];
                    const turn = this.locale === 'en-US' ? this.getNumSuffix(matches[2]) : matches[2];
                    trash_data.schedules.push(this.localtext.schedule.biweek.replace('%s1',turn).replace('%s2',this.localtext.weekday[weekday]));
                } else if(schedule.type == 'month') {
                    const day = this.locale === 'en-US' ? this.getNumSuffix(schedule.value) : schedule.value;
                    trash_data.schedules.push(`${this.localtext.schedule.month.replace('%s',day)}`);
                } else if(schedule.type == 'evweek') {
                    trash_data.schedules.push(`${this.localtext.schedule.evweek.replace('%s',this.localtext.weekday[schedule.value.weekday])}`);
                }
            });
            return_data.push(trash_data);
        });
        return return_data;
    }

    updateLastUsed(accessToken) {
        return new Promise((resolve,reject)=>{
            const today = this.calculateLocalTime(0);
            const params = {
                TableName: 'TrashSchedule',
                Key: {
                    id: accessToken
                },
                ExpressionAttributeNames: {
                    '#d' : 'last_used'
                },
                ExpressionAttributeValues: {
                    ':LastUsed': today.toISOString().substr(0,10)
                },
                UpdateExpression: 'SET #d = :LastUsed'
            };
            this.dynamoClient.update(params,(error,data)=>{
                if(error) {
                    reject('[ERROR]:'+error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /*
    指定したごみの種類から直近のゴミ捨て日を求める
    trashes: DynamoDBから取得したJSON形式のパラメータ
    target_type: ごみの種類
    */
    getDayFromTrashType(trashes,target_type,timezone) {
        const match_date_list = [];
        trashes.forEach((trash)=>{
            if(trash.type === target_type) {
                const key = trash.type === 'other' ? trash.trash_val : trash.type;
                // schedules:登録されているスケジュール,list:登録スケジュールに対応する直近の日にち,recent:listのうち最も近いの日にち
                if(!match_date_list[key]) match_date_list[key] = {schedules: [],list: [],recent: null};
                trash.schedules.forEach((schedule)=>{
                    match_date_list[key].schedules.push(schedule);
                });
            }
        });

        const today_dt = this.calculateLocalTime(0,timezone);
        Object.keys(match_date_list).forEach((key)=>{
            const match_data = match_date_list[key];
            let recently = new Date('9999/12/31');
            match_data.schedules.forEach((schedule)=>{
                let next_dt = _.cloneDeep(today_dt);
                if(schedule.type === 'weekday') {
                    let diff_day = Number(schedule.value) - today_dt.getDay();
                    diff_day < 0 ? next_dt.setDate(today_dt.getDate() + (7 + diff_day)) : next_dt.setDate(today_dt.getDate() + diff_day);
                } else if ((schedule.type === 'month')) {
                    let now_date = today_dt.getDate();
                    while(now_date != schedule.value) {
                        // スケジュールと現在の日にちの差分を取る
                        let diff_date = Number(schedule.value) - now_date;
                        if(diff_date < 0) {
                            // 現在日>設定日の場合は翌月の1日をセットする
                            next_dt.setMonth(next_dt.getMonth() + 1);
                            next_dt.setDate(1);
                            console.log(next_dt);
                        } else {
                            // 現在日<設定日の場合は差分の分だけ日にちを進める
                            next_dt.setDate(next_dt.getDate() + diff_date);
                        }
                        now_date = next_dt.getDate();
                    }
                } else if(schedule.type === 'biweek') {
                    // 設定値
                    const matches = schedule['value'].match(/(\d)-(\d)/);
                    const weekday = matches[1];
                    const turn = matches[2];

                    // 直近の同じ曜日の日にちを設定
                    let diff_day = Number(weekday) - today_dt.getDay();
                    diff_day < 0 ? next_dt.setDate(today_dt.getDate() + (7 + diff_day)) : next_dt.setDate(today_dt.getDate() + diff_day);

                    // 何週目かを求める
                    let nowturn = 0;
                    let targetdate = today_dt.getDate();
                    while(targetdate > 0) {
                        nowturn += 1;
                        targetdate -= 7;
                    }


                    let current_month = next_dt.getMonth();
                    while(turn != nowturn) {
                        next_dt.setDate(next_dt.getDate()+7);
                        if(current_month != next_dt.getMonth()) {
                            nowturn = 1;
                        } else {
                            nowturn += 1;
                        }
                    }
                } else if(schedule.type === 'evweek') {
                    const start_dt = new Date(schedule.value.start);
                    start_dt.setHours(0);
                    start_dt.setMinutes(0);
                    start_dt.setSeconds(0);
                    start_dt.setMilliseconds(0);

                    // 直近の同じ曜日の日にちを設定
                    let diff_date = Number(schedule.value.weekday) - today_dt.getDay();
                    diff_date < 0 ? next_dt.setDate(today_dt.getDate() + (7 + diff_date)) : next_dt.setDate(today_dt.getDate() + diff_date);

                    // 直近の同じ曜日の日にちの日曜日を取得
                    let current_dt = _.cloneDeep(next_dt);
                    current_dt.setHours(0);
                    current_dt.setMinutes(0);
                    current_dt.setSeconds(0);
                    current_dt.setMilliseconds(0);
                    current_dt.setDate(current_dt.getDate() - current_dt.getDay());

                    // 登録されている日付からの経過日数を求める
                    const past_date = (current_dt - start_dt) / 1000 / 60 / 60 / 24;

                    // 差が0以外かつあまりが0でなければ1週間進める
                    if(past_date != 0 && (past_date / 7) % 2 != 0) {
                        next_dt.setDate(next_dt.getDate()+7);
                    }
                }
                if(recently.getTime() > next_dt.getTime()) {
                    recently = next_dt;
                }
                match_data.list.push(_.cloneDeep(next_dt));
            });
            match_data.recent = recently;
        });
        return match_date_list;
    }

    getNumSuffix(number) {
        let suffix = 'th';
        if(number === '1') {
            suffix = 'st';
        } else if(number === '2') {
            suffix = 'nd';
        } else if(number === '3') {
            suffix = 'rd';
        }

        return String(number)+suffix;
    }

    getLocalText() {
        return this.localtext;
    }
}

module.exports = Client;
