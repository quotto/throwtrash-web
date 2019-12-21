const AWS = require('aws-sdk');
const firebase_admin = require('firebase-admin');
const rp = require('request-promise');
const jwt = require('jsonwebtoken');
const common_check = require('./common_check');

const MAX_AGE=3600;
const SESSIONID_NAME='throwaway-session';
const documentClient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});
firebase_admin.initializeApp({
    credential: firebase_admin.credential.applicationDefault()
});
const firestore = firebase_admin.firestore();

const URL_ACCOUNT_LINK = 'https://accountlink.mythrowaway.net';
const URL_BACKEND = 'https://backend.mythrowaway.net';

/**
 * 隔週スケジュールの開始日（今週の日曜日 または 来週の日曜日）を求める 
 * @param {int} weektype : 0:今週,1:来週
 * @param {int} offset : ユーザー地域のタイムゾーンオフセット
 */
const calculateStartDate = (weektype, offset) => {
    const utcdt = new Date();
    const localdt = new Date(utcdt.getTime() + (-1 * offset * 60 * 1000));
    localdt.setUTCDate(localdt.getUTCDate() - localdt.getUTCDay() + (7 * weektype));

    return `${localdt.getUTCFullYear()}-${localdt.getUTCMonth()+1}-${localdt.getUTCDate()}`;
};

const adjustData = (input_data, offset) => {
    let regist_data = [];
    input_data.forEach((trash)=>{
        let regist_trash = {
            type: trash.type
        };
        if(trash.type === 'other') {
            regist_trash.trash_val = trash.trash_val;
        }

        let trash_schedules = [];
        trash.schedules.forEach((schedule)=>{
            let regist_schedule = {
                type: schedule.type,
                value: schedule.value
            };
            if(regist_schedule.type && regist_schedule.type != 'none' && regist_schedule.value) {
                if(regist_schedule.type === 'evweek') {
                    const weektype = regist_schedule.value.start==='thisweek' ? 0 : 1;
                    const start_date = calculateStartDate(weektype, offset);
                    regist_schedule.value.start = start_date;
                }
                trash_schedules.push(regist_schedule);
            }
        });
        regist_trash.schedules = trash_schedules;
        regist_data.push(regist_trash);
    });
    return regist_data;
}

const generateState = (length)=>{
    if(length > 0 && length <= 36) {
        let state = ''
        for(let i=0; i<length; i++) {
            state += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*35)];
        }
        return state;
    }
    return null;
}

const getSession = async(sessionId) => {
    const params = {
        Key: {
            id: sessionId
        },
        TableName: 'ThrowTrashSession'
    }
    return documentClient.get(params).promise().then(async(data)=>{
        if(data.Item) {
            const expire = data.Item.expire;
            const now = new Date().getTime();
            if(expire >= now) {
                return data.Item;
            } else {
                console.warn(`session ${sessionId} is expired`);
                await documentClient.delete({
                    TableName: 'ThrowTrashSession',
                    Key:{id: sessionId}
                }).promise();
            }
        }
        return null;
    }).catch(error=>{
        console.error('Failed getSession.');
        console.error(error);
        return null;
    })
}

const extractSessionId = (cookie)=>{
    if(cookie) {
        const c_array = cookie.split(';');
        for(let i=0; i < c_array.length; i++) {
            const element = c_array[i];
            const start = element.indexOf(`${SESSIONID_NAME}=`);
            if(start >= 0) {
                return element.substring(start+(`${SESSIONID_NAME}=`.length))
            }
        }
    }
    return null;
};

const generateId = (separator='')=>{
    let uuid = '', i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if(i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += separator
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};

const publishSession = async()=>{
    const new_session =  {
            id: generateId(),
            expire: (new Date()).getTime()+(MAX_AGE*1000)
    }
    console.info('publish new session:',new_session);
    return documentClient.put({
        TableName: 'ThrowTrashSession',
        Item: new_session,
        ConditionExpression: 'attribute_not_exists(id)'
    }).promise().then(()=>{
        return new_session;
    }).catch((e)=>{
        console.error('Failed session value.')
        console.error(e.message);
        return null;
    });
};

const ServerError = {
    statusCode: 301,
    headers: {
        Location: 'https://accountlink.mythrowaway.net/500.html'
    }
};

const UserError = {
    statusCode: 301,
    headers: {
        Location: 'https://accountlink.mythrowaway.net/400.html'
    }
};

const getDataBySigninId = async(signinId)=>{
    console.debug('get data by signinId:'+signinId);
    return documentClient.query({
        TableName: 'TrashSchedule',
        IndexName: 'signinId-index',
        ExpressionAttributeNames: { '#i': 'signinId' } ,
        ExpressionAttributeValues: { ':val': signinId },
        KeyConditionExpression: '#i = :val'
    }).promise().then((data)=>{
        if(data.Count > 0) {
            console.debug('get data',data.Items[0]);
            return data.Items[0];
        }
        return {};
    }).catch(err=>{
        console.error(err);
        return null;
    });
}

const requestAmazonProfile = (access_token)=>{
    return rp({
        uri: 'https://api.amazon.com/user/profile',
        qs: {
            access_token: access_token
        },
        resolveWithFullResponse: true,
        json: true
    }).then(response => {
        console.debug('signin on amazon',JSON.stringify(response));
        if (response.statusCode === 200) {
            return {id: response.body.user_id, name: response.body.name};
        }
        console.error(response);
        throw new Error(response);
    }).catch(err=>{
        console.error(err);
        throw new Error(err);
    });
}

const requestGoogleProfile = (code,stage)=>{
    const options = {
        uri: 'https://oauth2.googleapis.com/token',
        method: 'POST',
        body: {
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${URL_BACKEND}/${stage}/signin?service=google`,
            grant_type: 'authorization_code'
        },
        json: true
    };
    return rp(options).then(response=>{
        console.debug('sign in on google:',response);
        if(response.id_token) {
            const decoded_token = jwt.decode(response.id_token);
            return {id: decoded_token.sub, name: decoded_token.name};
        } 
        return null;
    }).catch(err=>{
        console.error(err);
        return null;
    });
}

const saveSession = async(session)=>{
    console.debug('save session',session);
    return documentClient.put({
        TableName: 'ThrowTrashSession',
        Item: session
    }).promise().then(()=>{
        return true;
    }).catch(err=>{
        console.error(err);
        return false;
    });
}

const deleteSession = async(sessionId)=>{
    return documentClient.delete({
        TableName: 'ThrowTrashSession',
        Key:{
            id: sessionId
        }
    }).promise().then(()=>{
        return true;
    }).catch(err=>{
        console.error(err);
        return false;
    });
}

const publishId = async()=>{
    let user_id = null;
    // 初回登録は最大5回まで重複のないIDの採番を試みる
    let retry = 0;
    while(retry < 5) {
        user_id = generateId('-');
        try {
            const result = await documentClient.get({
                TableName: 'TrashSchedule',
                Key: {
                    id: user_id
                }
            }).promise();
            if(!result.Item) {
                console.debug('generate new id:', user_id);
                break;  
            }
            console.warn('duplicate id:',user_id);
            user_id = null;
            retry++;
        } catch(err) {
            console.error(err);
            return null;
        }
    }
    return user_id;
}

const registData = async(item, regist_data) =>{
    const params = {
        TableName: 'TrashSchedule',
        Item: item
    };
    console.debug('regist parameter:', params);
    return documentClient.put(params).promise().then(()=>{ 
        console.info(`Regist user(${JSON.stringify(item)})`);

        // Googleアシスタントの登録はfirestore登録後にリダイレクトする
        if (item.platform === 'google') {
            console.debug(`regist firestore: ${item.id},${JSON.stringify(regist_data)}`);
            return firestore.collection('schedule').doc(item.id).set({
                data: regist_data
            }).then(() => {
                console.info(`Regist user(Firestore)(${item.id}\n${JSON.stringify(regist_data)})`);
                return true;
            }).catch(err => {
                console.error(`DB Insert Error(Firestore)\n${err}`);
                return false;
            });
        }
        return true;
    }).catch(err => {
        console.error(`DB Insert Error\n${err}`);
        return false;
    });
}

const regist = async(body,session)=>{
    console.info(`Regist request from ${session.id}`);
    console.debug('Regist Data:',JSON.stringify(body));
    if(!body || !body.data || common_check.exist_error(body.data)) {
        console.error(`platform: ${session.platform}`);
        return {
            statusCode: 400,
            body: 'Bad Data'
        }
    }

    // 検証した登録データをセッションに格納
    const regist_data = adjustData(body.data, body.offset);

    if(session && session.state && session.client_id && session.redirect_uri) {
        const item = {};
        if(session.userInfo) {
            item.signinId = session.userInfo.signinId;
            item.signinService = session.userInfo.signinService;
            if(session.userInfo.id) {
                item.id = session.userInfo.id;
            }
        }
        if(!item.id) {
            const user_id = await publishId();
            if(!user_id) {
                console.error('Failed to create Id');
                return {
                    statusCode: 500,
                    body: 'Failed to publish id'
                }
            }
            item.id = user_id;
        }
        
        // データ登録
        item.description = JSON.stringify(regist_data, null, 2);
        item.platform  = session.platform;

        if(await registData(item, regist_data)) {
            await deleteSession(session.id);
            const redirect_url = `${session.redirect_uri}#state=${session.state}&access_token=${item.id}&client_id=${session.client_id}&token_type=Bearer`;
            console.debug('redirect to skill:',redirect_url);
            return {
                statusCode: 200,
                body: redirect_url,
                headers: {
                    'Access-Control-Allow-Origin': URL_ACCOUNT_LINK,
                    'Access-Control-Allow-Credentials': true
                }
            }
        } else {
            return {
                statusCode: 500,
                body: 'Registration Failed'
            }
        }
    } else {
        console.error('invalid session parameter'+
            `state:${session.state}\n` +
            `client_id:${session.client_id}\n` +
            `redirect_uri:${session.redirect_uri}\n` +
            `platform: ${session.platform}`);
        return {
            statusCode: 400,
            body: 'Invalid Session'
        }
    }

}

const user_info = (session)=>{
    let body = {
        name: null,
        preset: null
    };
    if(session && session.userInfo) {
        body.name = session.userInfo.name;
        body.preset = session.userInfo.preset;
    }
    return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': URL_ACCOUNT_LINK,
            'Access-Control-Allow-Credentials': true
        }
    }
}

const signout = async(session)=>{
    if(session.userInfo) {
        console.info('signout:'+session.userInfo.signinId);
        session.userInfo = undefined;
        return saveSession(session).then(()=>{
            return {
                statusCode: 200,
                body: 'signout',
                headers: {
                    'Access-Control-Allow-Origin': URL_ACCOUNT_LINK,
                    'Access-Control-Allow-Credentials': true
                }
            }
        });
    }
    console.warn('not signed in user');
    return {
        statusCode: 200,
        body: '',
        headers: {
            'Access-Control-Allow-Origin': URL_ACCOUNT_LINK,
            'Access-Control-Allow-Credentials': true
        }
    }
}

const signin = async(params,session,stage)=>{
    let service_request = null;
    if (params.service === 'amazon' && params.access_token && session) {
        service_request = requestAmazonProfile(params.access_token);
    } else if(params.service === 'google' 
                && params.code && params.state 
                && session && params.state === session.googleState) {
        service_request = requestGoogleProfile(params.code,stage);
    }  else {
        console.error('invalid parameter',params,session);
        return UserError;
    }

    const user_info = await service_request;
    if(user_info) {
        session.userInfo = {
            signinId: user_info.id,
            name: user_info.name,
            signinService: params.service
        };
        const user_data = await getDataBySigninId(user_info.id);
        if (user_data) {
            if(user_data.id) {
                session.userInfo.id = user_data.id;
                session.userInfo.preset = JSON.parse(user_data.description);
            } else {
                session.userInfo.preset = [];
            }

            if(await saveSession(session)) {
                return {
                    statusCode: 301,
                    headers: {
                        Location: `https://accountlink.mythrowaway.net/v${session.version}/index.html`,
                        'Cache-Control': 'no-store'
                    }
                }
            }
        }
    }
    return ServerError;
}

const oauth_request = async (params,session,new_flg)=> {
    if(params && params.state && params.client_id && params.redirect_uri && params.version && params.platform) {
        session.state = params.state;
        session.client_id = params.client_id;
        session.redirect_uri = params.redirect_uri;
        session.version = params.version;
        session.platform = params.platform;

        if(await saveSession(session)) {
            const response =  {
                statusCode: 301,
                headers: {
                    Location: `https://accountlink.mythrowaway.net/v${params.version}/index.html`
                }
            };
            if(new_flg) {
               response.headers['Set-Cookie'] = `${SESSIONID_NAME}=${session.id};max-age=${MAX_AGE};`;
            }
            return response;
        }
        return ServerError;

    } 
    return UserError;
};

const google_signin = async(session,stage)=>{
    const endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const google_state = generateState(16);
    const option = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        response_type:'code',
        scope:'openid profile',
        redirect_uri:`${URL_BACKEND}/${stage}/signin?service=google`,
        state: google_state,
        login_hint: 'mythrowaway.net@gmail.com',
        nonce: generateState(16)
    };
    const params_array = [];
    for(let [key, value] of Object.entries(option)) {
        params_array.push(`${key}=${value}`);
    }
    session.googleState = google_state;
    return saveSession(session).then(()=>{
        return {
            statusCode: 301,
            headers: {
                'Cache-Control': 'no-store',
                Location: endpoint + '?' + params_array.join('&')
            }
        }
    });
};

// eslint-disable-next-line no-unused-vars
exports.handler = async function(event,context) {
    console.log(event);
    console.log(context);
    let session = null;
    let sessionId = extractSessionId(event.headers.Cookie);
    console.debug('get sessionId in cookie:',sessionId);
    if(sessionId) {
        session = await getSession(sessionId);
        console.debug('get session',session);
    }
   if(event.resource === '/oauth_request')  {
       let new_session_flg = false;
       if(!session) {
           new_session_flg = true;
           session = await publishSession();
       }
       return oauth_request(event.queryStringParameters, session, new_session_flg);
   } else if(event.resource === '/google_signin') {
       if(session) {
           return google_signin(session, event.requestContext.stage);
       }
   } else if(event.resource === '/signin') {
       if(session) {
           return signin(event.queryStringParameters,session,event.requestContext.stage);
       }
   } else if(event.resource === '/signout') {
       if(session) {
           return signout(session);
       }
   } else if(event.resource === '/user_info') {
       return user_info(session);
   } else if(event.resource === '/regist') {
       if(session) {
           try {
               const body = JSON.parse(event.body);
               return regist(body, session);
           } catch(err){ 
               console.error(err);
               return {
                   statusCode: 400,
                   body: 'BadData'
               };
           }
       }
       // /registはフォームから非同期で呼ばれるためエラーの場合は400を返す
       return {
           statusCode: 400,
           body: 'Invalid Session'
       };
   }
   return UserError;
};