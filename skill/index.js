'use strict';

const Alexa = require('alexa-sdk');
const Client = require('client.js');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

const NothingMessage = '今日、出せるゴミ、はありません。';

const ErrorMessage = 'エラーが発生しました。'

const AccountLinkMessage = 'スキルを利用するためにはTwitterでのログインを許可してください';

const TrashType = {
    burn : 'もえるゴミ',
    unburn: 'もえないゴミ',
    plastic: 'プラスチック',
    bottole: 'ビン・カン',
    petbottle: 'ペットボトル',
    paper: '古紙',
    resource: '資源ごみ',
    coarse: '粗大ごみ'
}

function calculateJSTTime() {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    var dt = new Date(jsttime);
    return dt;
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GetTrashes' : function() {
        // アクセストークンの取得
        var accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }

        var accessKey = accessToken.split(',');
        Client.getEnableTrashes(accessKey[0],accessKey[1]).then((response)=>{
            var body = JSON.parse(response);
            if(body.result.length > 0) {
                const textArray = body.result.map((key)=>{
                    return TrashType[key]
                })
                this.emit(':tell',`今日出せるゴミは、${textArray.join('、')}、です。`);
            } else {
                this.emit(':tell',NothingMessage);
            }
        },(error)=>{
            console.log(error);
            this.emit(':tell',ErrorMessage);
        })
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '今日のゴミ出しをお知らせします。今日のゴミ出しは？と聞いてください。事前にウェブページからゴミ出しのスケジュールを登録してください。';
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
