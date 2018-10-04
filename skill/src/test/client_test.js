const assert = require('assert');
const sinon = require('sinon');
const rewire = require('rewire');
const Client = rewire('../client.js');
const AWS = require('aws-sdk');

const rightAccessToken='50f53d89-3ee7-4de0-bb14-93d623674b20';
var credential = new AWS.Credentials(process.env.AWS_ACCESS_TOKEN,process.env.AWS_ACCESS_TOKEN_SECRET,null);
const dynamoClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    apiVersion: '2012-08-10',
    credentials: credential
})

const update_table = (value)=>{
    let params = {
        TableName: 'TrashSchedule',
        Key: {
            id: rightAccessToken
        },
        UpdateExpression: 'set description = :val',
        ExpressionAttributeValues: {
            ':val': value
        },
        ReturnValues:'UPDATED_NEW'
    };
    dynamoClient.update(params,(err,data)=>{
        if (err) {
            console.error('Unable to update ite. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Restore succeeded:', JSON.stringify(data, null, 2));
        }
    });
};

describe('Client',function(){
    describe('calculateJSTTime',function(){
        let _invocate_calculateJSTTime = Client.__get__('calculateJSTTime');
        it('今日の日付',function(){
            let dt = _invocate_calculateJSTTime(0);
            assert.equal(dt.getDate(),(new Date()).getDate());
            assert.equal(dt.getDay(),(new Date()).getDay());
        })

        it('明日の日付',function(){
            let dt = _invocate_calculateJSTTime(1);
            var tommorow = (new Date(new Date().valueOf() + (24*60*60*1000)));
            assert.equal(dt.getDate(),tommorow.getDate());
            assert.equal(dt.getDay(),tommorow.getDay());
        })
    })

    describe('get_enable_trashes',function(){
        let _invocate_check_schedule = Client.__get__('get_enable_trashes');
        const testdata = { 'Item': { 'description': "[ { 'type': 'burn','trash_val': '', 'schedules': [ { 'type': 'weekday', 'value': '3' }, { 'type': 'weekday', 'value': '6' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'plastic', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '1' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'paper','trash_val': '', 'schedules': [ { 'type': 'none', 'value': '' }, { 'type': 'biweek', 'value': '1-2' }, { 'type': 'none', 'value': '' } ]}, { 'type': 'bottole', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'petbottle', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'month', 'value': '11' }, { 'type': 'none', 'value': '' } ] } ]"} }
        it('weekday',function(){
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018/03/01');
                }
            });

            let result = _invocate_check_schedule(testdata,0);
            assert.equal(result.length,2);
            assert.equal('ビン<break time="1ms"/>カン',result[0]);
            assert.equal('ペットボトル',result[1]);

            revert();
        })
        it('biweek',function(){
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018/03/12');
                }
            });
            let result = _invocate_check_schedule(testdata,0);
            assert.equal(2,result.length);
            assert.equal('プラスチック',result[0]);
            assert.equal('古紙',result[1]);

            revert();
        });
        it('month',function(){
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018/03/11');
                }
            });
            let result = _invocate_check_schedule(testdata,0);
            assert.equal(1,result.length);
            assert.equal('ペットボトル',result[0]);

            revert();
        });
        it('evweek',function(){
            let revert = Client.__set__({
                'calculateJSTTime': ()=>{
                    return new Date('2018-09-26');
                }
            });
            const testdata =
                    [
                        {
                            // 曜日が一致し該当週のため対象
                            type: 'burn',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '3',
                                        start: '2018-09-09'
                                    }
                                }
                            ]
                        },
                        {
                            // 該当集だが曜日が一致しないので対象外
                            type: 'other',
                            trash_val: '新運',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '1',
                                        start: '2018-09-09'
                                    }
                                }
                            ]
                        },
                        {
                            // 登録週=今週かつ曜日が一致のため対象
                            type: 'plastic',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '3',
                                        start: '2018-09-23'
                                    }
                                }
                            ]
                        },
                        {
                            // 翌週が該当週のため対象外
                            type: 'can',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '3',
                                        start: '2018-09-30'
                                    }
                                }
                            ]
                        },
                        {
                            // 前週が該当のため対象外
                            type: 'paper',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '3',
                                        start: '2018-09-16'
                                    }
                                }
                            ]
                        },
                        {
                            // 4週間前のため一致
                            type: 'bin',
                            schedules: [
                                {
                                    type: 'evweek',
                                    value: {
                                        weekday: '3',
                                        start: '2018-08-26'
                                    }
                                }
                            ]
                        }
                    ];

            let result = _invocate_check_schedule({Item: {description:JSON.stringify(testdata)}},0);
            assert.equal(result.length,3);
            assert.equal(result[0],'もえるゴミ');
            assert.equal(result[1],'プラスチック');
            assert.equal(result[2],'ビン');
            revert();
        });
        it('none',function(){
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018/03/04');
                }
            });
            let result = _invocate_check_schedule(testdata,0);
            assert.equal(0,result.length);

            revert();
        });
    });
    describe('get_enable_trashes 重複排除機能',function(){
        let _invocate_check_schedule = Client.__get__('get_enable_trashes');
        it('重複の排除',function(){
            let testdata = {'Item': {'description' :
            JSON.stringify([
                {
                    'type': 'burn',
                    'trash_val': '',
                    'schedules': [
                        {
                            'type': 'weekday',
                            'value': '0'
                        },
                        {
                            'type': 'weekday',
                            'value': '6'
                        },
                        {
                            'type': 'none',
                            'value': ''
                        }
                    ]
                },
                {
                    'type': 'burn',
                    'trash_val': '',
                    'schedules': [
                        {
                            'type': 'weekday',
                            'value': '0'
                        },
                        {
                            'type': 'weekday',
                            'value': '6'
                        },
                        {
                            'type': 'none',
                            'value': ''
                        }
                    ]
                }
            ])}};
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018-09-29 00:00');
                }
            });
            const response = _invocate_check_schedule(testdata,0);
            assert.equal(response.length,1);
            revert();
        });
        it('otherの場合はtrash_valが同じ場合のみ重複排除',function(){
            let testdata = {'Item': {'description' :
                JSON.stringify(
                    [
                        {
                            'type': 'other',
                            'trash_val': '廃品',
                            'schedules': [
                                {
                                    'type': 'weekday',
                                    'value': '0'
                                },
                                {
                                    'type': 'weekday',
                                    'value': '6'
                                },
                                {
                                    'type': 'none',
                                    'value': ''
                                }
                            ]
                        },
                        {
                            'type': 'other',
                            'trash_val': '発泡スチロール',
                            'schedules': [
                                {
                                    'type': 'weekday',
                                    'value': '0'
                                },
                                {
                                    'type': 'weekday',
                                    'value': '6'
                                },
                                {
                                    'type': 'none',
                                    'value': ''
                                }
                            ]
                        },
                        {
                            'type': 'other',
                            'trash_val': '廃品',
                            'schedules': [
                                {
                                    'type': 'weekday',
                                    'value': '0'
                                },
                                {
                                    'type': 'weekday',
                                    'value': '6'
                                },
                                {
                                    'type': 'none',
                                    'value': ''
                                }
                            ]
                        }
                    ])}};
            let revert = Client.__set__({
                'calculateJSTTime':()=>{
                    return new Date('2018-09-29 00:00');
                }
            });
            let response = _invocate_check_schedule(testdata,0);
            assert.equal(response.length,2);
            assert.equal(response[0],'廃品');
            assert.equal(response[1],'発泡スチロール');
            revert();
        });
    });
    describe('getEnableTrashes',function(){
        it('不正なパラメータ',function(done){
            Client.getEnableTrashes({test:'aaa'},0).then((response)=>{}).catch((error)=>{
                assert.equal(error,'情報の取得に失敗しました。スキル開発者にお問い合わせください。');
                done();
            });
        });
        it('未登録のuuid',function(done){
            Client.getEnableTrashes('1439d8b1-b41e-45f9-9afc-ecdfdaea1d83',0).then((response)=>{}).catch((error)=>{
                assert.equal(error,'登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。');
                done();
            });
        });
    });
    describe('getEnableTrashesByWeekday',function(){
        let backup_data = '';
        let testdata = [
            {
                'type': 'burn',
                'trash_val': '',
                'schedules': [
                    {
                        'type': 'weekday',
                        'value': '3'
                    },
                    {
                        'type': 'weekday',
                        'value': '6'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            },
            {
                'type': 'plastic',
                'trash_val': '',
                'schedules': [
                    {
                        'type': 'weekday',
                        'value': '1'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            },
            {
                'type': 'paper',
                'trash_val': '',
                'schedules': [
                    {
                        'type': 'biweek',
                        'value': '0-2'
                    },
                    {
                        'type': 'biweek',
                        'value': '1-2'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            },
            {
                'type': 'bottole',
                'trash_val': '',
                'schedules': [
                    {
                        'type': 'weekday',
                        'value': '4'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            },
            {
                'type': 'petbottle',
                'trash_val': '',
                'schedules': [
                    {
                        'type': 'weekday',
                        'value': '4'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            },
            {
                'type': 'other',
                'trash_val': '廃品',
                'schedules': [
                    {
                        'type': 'weekday',
                        'value': '3'
                    },
                    {
                        'type': 'none',
                        'value': ''
                    },
                    {
                        'type': 'none',
                        'value': ''
                    }
                ]
            }
        ];

        before(()=>{
            const GetBackUp = dynamoClient.get(
                {
                    TableName: 'TrashSchedule',
                    Key: {
                        id: rightAccessToken
                    }
                },
                (err,data)=>{
                    backup_data = data['Item']['description'];
                }
            );

            Promise.all([GetBackUp]).then(()=>{
                backup_data(JSON.stringify(testdata));
            });
        });
        it('日曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,0).then((response)=>{
                assert.equal(response.length,0);
                done();
            });
        });
        it('水曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,3).then((response)=>{
                assert.equal(response.length,2);
                assert.equal('もえるゴミ',response[0]);
                assert.equal('廃品',response[1]);
                done();
            }).catch((error)=>{
                console.log(error);
                assert(false);
                done();
            });
        });
        it('土曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,6).then((response)=>{
                assert.equal(response.length,1);
                done();
            }).catch((error)=>{
                console.log(error);
                assert(false);
                done();
            });
        });
        after(()=>{
            if(backup_data) {
                update_table(backup_data);
            }
        });
    });
});
