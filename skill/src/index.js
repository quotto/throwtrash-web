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
    {value:2,speech:'<sub alias="あさって">明後日</sub>'},
    {value:3,weekday:0,speech:'日曜日'},
    {value:4,weekday:1,speech:'月曜日'},
    {value:5,weekday:2,speech:'火曜日'},
    {value:6,weekday:3,speech:'水曜日'},
    {value:6,weekday:4,speech:'木曜日'},
    {value:8,weekday:5,speech:'金曜日'},
    {value:9,weekday:6,speech:'土曜日'}
];

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
    'GetPointDayTrashes' : function() {
        const accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }

        if(this.event.request.intent.slots.DaySlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            const slotValue =this.event.request.intent.slots.DaySlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            if(slotValue >= 0 && slotValue <= 2) {
                // アクセストークンの取得
                Client.getEnableTrashes(accessToken,PointDayValue[slotValue].value).then((response)=>{
                    if(response.length > 0) {
                        this.emit(':tell',`${PointDayValue[slotValue].speech}出せるゴミは、${response.join('、')}、です。`);
                    } else {
                        this.emit(':tell',`${PointDayValue[slotValue].speech}${NothingMessage}`);
                    }
                },(error)=>{
                    this.emit(':tell',error);
                });
            } else {

                Client.getEnableTrashesByWeekday(accessToken,PointDayValue[slotValue].weekday).then((response)=>{
                    if(response.length > 0) {
                        this.emit(':tell',`次の${PointDayValue[slotValue].speech}に出せるゴミは、${response.join('、')}、です。`);
                    } else {
                        this.emit(':tell',`次の${PointDayValue[slotValue].speech}に${NothingMessage}`);
                    }
                },(error)=>{
                    this.emit(':tell',error);
                });
            }
        } else {
            const speechOut = 'いつの予定が知りたいですか？';
            this.emit(':elicitSlot','DaySlot',speechOut,speechOut);
        }
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
