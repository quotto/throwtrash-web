'use strict';

const Alexa = require('alexa-sdk')
const Client = require('client.js')

const APP_ID = 'amzn1.ask.skill.2ef932ba-f1a7-4638-ba85-90ad90a1f0c0'

const NothingMessage = '出せるゴミはありません。'

const ErrorMessage = 'エラーが発生しました。'

const AccountLinkMessage = 'スキルを利用するためにはアカウントリンクが必要です。'

const TrashType = {
    burn : 'もえるゴミ',
    unburn: 'もえないゴミ',
    plastic: 'プラスチック',
    bottole: 'ビン<break time="1ms"/>カン',
    petbottle: 'ペットボトル',
    paper: '古紙',
    resource: '<say-as interpret-as="interjection">資源ゴミ</say-as>',
    coarse: '<say-as interpret-as="interjection">粗大ゴミ</say-as>'
}

const TargetDay = {
    '今日':0,
    'きょう':0,
    '明日':1,
    'あした':1,
    '明後日':2,
    'あさって':2
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent')
    },
    'GetTrashes' : function() {
        const targetDay = this.event.request.intent.slots.TargetDay.value; // スロットTargetDayを参照
        // アクセストークンの取得
        const accessToken = this.event.session.user.accessToken
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage)
            return
        }
        Client.getEnableTrashes(accessToken,TargetDay[targetDay]).then((response)=>{
            if(response.length > 0) {
                const textArray = response.map((key)=>{
                    return TrashType[key]
                })
                this.emit(':tell',`${targetDay}出せるゴミは、${textArray.join('、')}、です。`)
            } else {
                this.emit(':tell',`${targetDay}${NothingMessage}`)
            }
        },(error)=>{
            this.emit(':tell',error)
        })
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '今日のゴミ出しをお知らせします。今日のゴミ出しは？と聞いてください。'
        const reprompt = speechOutput
        this.emit(':ask', speechOutput, reprompt)
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'))
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'))
    },
    'SessionEndedRequest': function(){
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context)
    alexa.APP_ID = APP_ID
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers)
    alexa.execute()
};
