'use strict';

const Alexa = require('ask-sdk');
const Client = require('client.js');
const dateformat = require('dateformat');
const _ = require('lodash');
let LocaleText;

const PointDayValue = [
    {value:0},
    {value:1},
    {value:2},
    {value:3,weekday:0},
    {value:4,weekday:1},
    {value:5,weekday:2},
    {value:6,weekday:3},
    {value:6,weekday:4},
    {value:8,weekday:5},
    {value:9,weekday:6}
];

const updateLastUsed = (handlerInput,client,accessToken) => {
    const attribute = handlerInput.attributesManager.getSessionAttributes();
    if(!attribute.updateflg) {
        console.log('update');
        attribute.updateflg = true;
        client.updateLastUsed(accessToken).then(()=>{console.log(`updateLastUsed:${accessToken}`)})
        handlerInput.attributesManager.setSessionAttributes(attribute);
    }
}

const initClient = async (handlerInput)=>{
    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();  // Clientの作成
    const timezone = deviceId ? await upsServiceClient.getSystemTimeZone(deviceId) : 'Asia/Tokyo'; // タイムゾーンの取得

    const locale = handlerInput.requestEnvelope.request.locale;
    LocaleText =  require(`template_text/${locale}.text.json`);
    return new Client(locale,timezone);
}

let skill;
exports.handler = async function(event,context) {
    if(!skill) {
        skill = Alexa.SkillBuilders.standard()
            .addRequestHandlers(
                LaunchRequestHandler,
                GetPointDayTrashesHandler,
                GetRegisteredContent,
                GetDayFromTrashTypeIntent,
                HelpIntentHandler,
                CancelAndStopIntentHandler,
                SessionEndedRequestHandler,
                NextPreviousIntentHandler
            )
            .withSkillId(process.env.APP_ID)
            .create();
    }
    return skill.invoke(event,context);
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput){
        const client = await initClient(handlerInput);
        // アクセストークンの取得
        const accessToken = handlerInput.requestEnvelope.session.user.accessToken;
        if(accessToken) {
            try {

                const data = await client.getTrashData(accessToken);
                const first = client.checkEnableTrashes(data.response,0);
                const second = client.checkEnableTrashes(data.response,1);
                const third = client.checkEnableTrashes(data.response,2);

                const reprompt_message = LocaleText.message.notice.continue;
                if(first.length > 0) {
                    handlerInput.responseBuilder
                        .speak(LocaleText.message.result.launch.replace("%s",create_response_trash_text(first)) + reprompt_message);
                } else {
                    handlerInput.responseBuilder
                        .speak(LocaleText.message.result.launchnothing + reprompt_message);
                }
                if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
                    set_display_directive(handlerInput,client,0,first,second,third);
                }

                updateLastUsed(handlerInput,client,accessToken);

                return handlerInput.responseBuilder
                    .reprompt(reprompt_message)
                    .getResponse();
            } catch(error) {
                return handlerInput.responseBuilder
                    .speak(error.message)
                    .getResponse();
            }
        } else {
            // トークン未定義の場合はユーザーに許可を促す
            return handlerInput.responseBuilder
                .speak(LocaleText.message.help.account)
                .withLinkAccountCard()
                .getResponse();
        }
    }
};

const GetPointDayTrashesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                handlerInput.requestEnvelope.request.intent.name === 'GetPointDayTrashes';
    },
    async handle(handlerInput){
        const client = await initClient(handlerInput);
        const accessToken = handlerInput.requestEnvelope.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            return handlerInput.responseBuilder
                .speak(LocaleText.message.help.account)
                .withLinkAccountCard()
                .getResponse();
        }
        const resolutions = handlerInput.requestEnvelope.request.intent.slots.DaySlot.resolutions;
        if(resolutions && resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            const slotValue =handlerInput.requestEnvelope.request.intent.slots.DaySlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;

            let target_day = 0;
            if(slotValue >= 0 && slotValue <= 2) {
                target_day = PointDayValue[slotValue].value;
            } else {
                target_day = await client.getTargetDayByWeekday(PointDayValue[slotValue].weekday);
            }


            try {
                const result = await client.getTrashData(accessToken);
                const first = client.checkEnableTrashes(result.response,target_day);
                const second = client.checkEnableTrashes(result.response,target_day+1);
                const third = client.checkEnableTrashes(result.response,target_day+2);
                let speechOut;
                if(first.length > 0) {
                    speechOut = LocaleText.message.result.pointday.replace('%s1',LocaleText.pointday[slotValue]).replace('%s2',create_response_trash_text(first));
                } else {
                    speechOut = LocaleText.message.result.pointnothing.replace('%s',LocaleText.pointday[slotValue]);
                }
                handlerInput.responseBuilder.speak(speechOut);
                if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
                    set_display_directive(handlerInput,client,target_day,first,second,third);
                }

                updateLastUsed(handlerInput,client,accessToken);

                return handlerInput.responseBuilder.getResponse();
            }catch(error) {
                console.log('[ERROR]:(GetPointDayTrashes)'+error.message);
                return handlerInput.responseBuilder
                    .speak(error.message)
                    .getResponse();
            }
        } else {
            const speechOut = LocaleText.message.notice.pointdayquestion;
            return handlerInput.responseBuilder
                .speak(speechOut)
                .reprompt(speechOut)
                .getResponse();
        }
    }
};

const GetRegisteredContent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                handlerInput.requestEnvelope.request.intent.name === 'GetRegisteredContent';
    },
    async handle(handlerInput) {
        const client = await initClient(handlerInput);
        const accessToken = handlerInput.requestEnvelope.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            return handlerInput.responseBuilder
                .speak(LocaleText.message.help.account)
                .withLinkAccountCard()
                .getResponse();
        }
        try {
            const result = await client.getTrashData(accessToken);
            const schedule_data = client.getAllSchedule(result.response);
            if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
                set_show_schedule(handlerInput,schedule_data);
            }
            let card_text = '';
            schedule_data.forEach((data)=>{
                card_text += `${data.typeText}: ${data.schedules.join(LocaleText.message.separate)}\n`;
            });

            updateLastUsed(handlerInput,client,accessToken);

            return handlerInput.responseBuilder.speak(LocaleText.message.notice.registerdresponse).withSimpleCard(LocaleText.message.notice.registerdcardtitle,card_text).getResponse();
        } catch(error) {
            console.log('[ERROR]:(GetRegisterdContent)'+error.message);
            return handlerInput.responseBuilder
                .speak(error.message)
                .getResponse();
        }
    }
};

const GetDayFromTrashTypeIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                handlerInput.requestEnvelope.request.intent.name === 'GetDayFromTrashType';
    },
    async handle(handlerInput) {
        const client = await initClient(handlerInput);
        const accessToken = handlerInput.requestEnvelope.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            return handlerInput.responseBuilder
                .speak(LocaleText.message.help.account)
                .withLinkAccountCard()
                .getResponse();
        }
        try {
            const resolutions = handlerInput.requestEnvelope.request.intent.slots.TrashTypeSlot.resolutions;
            if(resolutions && resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                const slotValue =resolutions.resolutionsPerAuthority[0].values[0].value;
                const trashdata = await client.getTrashData(accessToken);
                const result = client.getDayFromTrashType(trashdata.response,slotValue.id);
                let dateText;
                if(Object.keys(result).length > 0) {
                    if(slotValue.id === 'other') {
                        const part = [];
                        Object.keys(result).forEach((key)=>{
                            part.push(LocaleText.message.result.fromtrashotherpart.replace('%s1',key)
                                        .replace('%s2',LocaleText.message.result.fromtrashdate
                                        .replace("%m",LocaleText.month ? LocaleText.month[result[key].recent.getMonth()] : result[key].recent.getMonth()+1)
                                        .replace('%d',result[key].recent.getDate())
                                        .replace('%w',LocaleText.weekday[result[key].recent.getDay()]))
                                    );
                        });
                        dateText = LocaleText.message.result.fromtrashother.replace('%s',get_multiple_text(part));
                    } else {
                        dateText = LocaleText.message.result.fromtrash.replace('%s1',slotValue.name)
                                    .replace('%s2',LocaleText.message.result.fromtrashdate
                                    .replace("%m",LocaleText.month ? LocaleText.month[result[slotValue.id].recent.getMonth()] : result[slotValue.id].recent.getMonth()+1)
                                    .replace('%d',result[slotValue.id].recent.getDate())
                                    .replace('%w',LocaleText.weekday[result[slotValue.id].recent.getDay()]));
                    }
                } else {
                    dateText = LocaleText.message.result.fromtrashnothing.replace('%s',slotValue.name);
                }

                updateLastUsed(handlerInput,client,accessToken);

                return handlerInput.responseBuilder.speak(dateText).getResponse();
            } else {
                return handlerInput.responseBuilder
                        .speak(LocaleText.message.notice.fromtrashquestion)
                        .reprompt(LocaleText.message.notice.fromtrashquestion)
                        .getResponse();
            }
        } catch(error) {
            console.log('[ERROR]:(GetDayFromTrashTypeIntent)'+error.message);
            return handlerInput.responseBuilder
                .speak(error.message)
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
             handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const client = await initClient(handlerInput);
        const speechOutput = LocaleText.message.help.help;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();

    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    async handle(handlerInput) {
        const client = await initClient(handlerInput);
        const speechOutput = LocaleText.message.help.bye;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();

    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .withShouldEndSession(true)
            .getResponse();
    }
};

const NextPreviousIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent');
    },
    async handle(handlerInput) {
        const client = await initClient(handlerInput);
        return handlerInput.responseBuilder
            .speak(LocaleText.message.help.nextprevious)
            .reprompt()
            .getResponse();
    }
};

const set_display_directive = (handlerInput,client,target_day,first,second,third)=>{
    const document = create_display_directive();
    const datasources = create_data_sources(client,target_day,first,second,third);
    datasources.dataSources.listTemplate2Metadata.title = LocaleText.display.scheduletitle;
    handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: document.document,
        datasources: datasources.dataSources
    }).withShouldEndSession(true);
};

const set_show_schedule = (handlerInput,regist_data) =>{
    const locale = handlerInput.requestEnvelope.request.locale;
    const document = create_display_directive();
    const datasources = _.cloneDeep(require('datasources.json'));
    datasources.dataSources.listTemplate2Metadata.title = LocaleText.display.registerdtitle;
    datasources.dataSources.listTemplate2ListData.totalNumberOfItems = regist_data.length;
    regist_data.forEach((trash)=>{
        const item = _.cloneDeep(require('item_format.json'));
        item.listItemIdentifier = trash.type;
        item.token = trash.type;
        item.textContent.primaryText.text = trash.typeText;
        item.textContent.secondaryText.text = trash.schedules.join('<br>');
        item.image.sources.push(
            {
                url: `https://s3-ap-northeast-1.amazonaws.com/myskill-image/throwtrash/${locale}/${trash.type}.png`,
                size: 'small',
                widthPixels: 0,
                heightPixels: 0
            }
        );
        datasources.dataSources.listTemplate2ListData.listPage.listItems.push(item);
    });
    handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: document.document,
        datasources: datasources.dataSources
    }).withShouldEndSession(true);
};

const create_response_trash_text = (data)=> {
    const response_text = [];
    data.forEach((trash_data)=> {
        response_text.push(trash_data.trash_name);
    });
    return get_multiple_text(response_text);
};

const get_list_item = (client,target_day,data)=> {
    const item = _.cloneDeep(require('item_format.json'));
    const target_date = client.calculateLocalTime(target_day);
    item.listItemIdentifier = new String(target_day);
    item.token = new String(target_day);
    item.textContent.primaryText.text = dateformat(target_date,'yyyy/mm/dd')+`(${LocaleText.weekday[target_date.getDay()]})`;
    item.textContent.secondaryText.text = data.length > 0 ? create_response_trash_text(data) : LocaleText.display.nothing;
    if(data.length > 0) {
        data.forEach((trashdata)=>{
            const filename = `https://s3-ap-northeast-1.amazonaws.com/myskill-image/throwtrash/${client.locale}/${trashdata.type}.png`;
            item.image.sources.push(
                {
                    url: filename,
                    size: 'small',
                    widthPixels: 0,
                    heightPixels: 0
                }
            );
        });
    }
    return item;
};

const create_data_sources = (client,target_day,first,second,third)=> {
    const datasources = _.cloneDeep(require('datasources.json'));
    const item1 = get_list_item(client,target_day,first);
    const item2 = get_list_item(client,target_day+1,second);
    const item3 = get_list_item(client,target_day+2,third);
    datasources.dataSources.listTemplate2ListData.listPage.listItems.push(item1);
    datasources.dataSources.listTemplate2ListData.listPage.listItems.push(item2);
    datasources.dataSources.listTemplate2ListData.listPage.listItems.push(item3);

    return datasources;
};

const create_display_directive = ()=> {
    return require('apl_template_export.json');
};

const get_multiple_text = (data)=>{
    let response = data.join(LocaleText.message.separate);
    if(LocaleText.message.check_multiple && data.length > 1) {
        const indexsep = LocaleText.message.separate;
        response = `${response.substr(0,response.lastIndexOf(indexsep))} ${LocaleText.message.endsep} ${response.substr(response.lastIndexOf(indexsep)+1)}`;
    }
    return response;
};
