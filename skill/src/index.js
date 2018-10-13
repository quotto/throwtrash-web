'use strict';

const Alexa = require('alexa-sdk');
const Client = require('client.js');

const APP_ID = 'amzn1.ask.skill.2ef932ba-f1a7-4638-ba85-90ad90a1f0c0';

const NothingMessage = '出せるゴミはありません。';

const AccountLinkMessage = 'スキルを利用するためにはアカウントリンクが必要です。' +
                            'Alexaアプリのホーム画面に表示されたアカウントリンク用カードから、設定を行ってください。';

const PointDayValue = [
    {value:0,speech:'今日'},
    {value:1,speech:'<sub alias="あした">明日</sub>'},
    {value:2,speech:'<sub alias="あさって">明後日</sub>'}
];

const WeekDayValue = {
    '日曜日':0,
    '月曜日':1,
    '火曜日':2,
    '水曜日':3,
    '木曜日':4,
    '金曜日':5,
    '土曜日':6,
    '日曜':0,
    '月曜':1,
    '火曜':2,
    '水曜':3,
    '木曜':4,
    '金曜':5,
    '土曜':6
};

const handlers = {
    'LaunchRequest': function () {
        const speechOutput = '今日のゴミ出しをお知らせします。今日のゴミ出しは？と聞いてください。';
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
    'GetTrashes' : function() {
        // アクセストークンの取得
        const accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }
        Client.getEnableTrashes(accessToken,0).then((response)=>{
            if(response.length > 0) {
                this.emit(':tell',`今日出せるゴミは、${response.join('、')}、です。`);
            } else {
                this.emit(':tell',`今日${NothingMessage}`);
            }
        },(error)=>{
            this.emit(':tell',error);
        });
    },
    'GetWeekDayTrashes' : function() {
        const slotValue =this.event.request.intent.slots.WeekDaySlot.value;
        // アクセストークンの取得
        const accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }
        Client.getEnableTrashesByWeekday(accessToken,WeekDayValue[slotValue]).then((response)=>{
            if(response.length > 0) {
                // const textArray = response.map((key)=>{
                //     return TrashType[key]
                // })
                this.emit(':tell',`次の${slotValue}に出せるゴミは、${response.join('、')}、です。`);
            } else {
                this.emit(':tell',`次の${slotValue}に${NothingMessage}`);
            }
        },(error)=>{
            this.emit(':tell',error);
        });
    },
    'GetPointDayTrashes' : function() {
        const slotValue =this.event.request.intent.slots.DaySlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        // アクセストークンの取得
        const accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }
        Client.getEnableTrashes(accessToken,PointDayValue[slotValue].value).then((response)=>{
            if(response.length > 0) {
                this.emit(':tell',`${PointDayValue[slotValue].speech}出せるゴミは、${response.join('、')}、です。`);
            } else {
                this.emit(':tell',`${PointDayValue[slotValue].speech}${NothingMessage}`);
            }
        },(error)=>{
            this.emit(':tell',error);
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '「今日」「あした」「あさって」または「曜日」を指定してゴミ出し予定を確認できます。例えば、水曜日の予定は？と聞いてください。';
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function(){
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
