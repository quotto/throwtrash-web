const assert = require('assert');
const sinon = require('sinon');
const rewire = require('rewire');
const Client = rewire('client.js');
const template_text = require('template_text.json');


describe('Client,en-US',function(){
    let client;
    before(()=>{
        client = new Client('en-US','America/New_York');
    });
    describe('getTrashData',()=>{
        it('未登録のuuid',(done)=>{
            client.getTrashData('aaaaaaaa').then(()=>{}).catch((error)=>{
                assert.equal(error.message,template_text['en-US'].message.error.idnotfound);
                done();
            });
        });
    });
    describe('checkEnableTrashes',()=>{
        let stub;
        before(()=>{
            stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018/03/01'));
        });
        it('',function(){
            const testdata = [ { 'type': 'burn','trash_val': '', 'schedules': [ { 'type': 'weekday', 'value': '3' }, { 'type': 'weekday', 'value': '6' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'plastic', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '1' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'paper','trash_val': '', 'schedules': [ { 'type': 'none', 'value': '' }, { 'type': 'biweek', 'value': '1-2' }, { 'type': 'none', 'value': '' } ]}, { 'type': 'plastic', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'petbottle', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'month', 'value': '11' }, { 'type': 'none', 'value': '' } ] } ];

            try{
                let result = client.checkEnableTrashes(testdata,0);
                assert.equal(result.length,2);
                assert.equal(result[0].trash_name,'plastic');
                assert.equal(result[1].trash_name,'plastic bottle');
            } finally{
                stub.restore();
            }
        });
        after(()=>{
            stub.restore();
        });
    });
    describe('getAllSchedule',()=>{
        it('全パターン検証',()=>{
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
                        },
                        {
                            type: 'month',
                            value: '10'
                        }
                    ]
                },
                {
                    type: 'other',
                    trash_val: 'pokemon',
                    schedules: [
                        {
                            type: 'weekday',
                            value: '0'
                        },
                        {
                            type: 'biweek',
                            value: '5-2'
                        }
                    ]
                },
                {
                    type: 'plastic',
                    schedules: [
                        {
                            type: 'weekday',
                            value: '0'
                        }
                    ]
                },
                {
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
                },
                {
                    type: 'petbottle',
                    schedules: [
                        {
                            type: 'evweek',
                            value: {
                                weekday: '3',
                                start: '2018-08-26'
                            }
                        }
                    ]
                },
                {
                    type: 'coarse',
                    schedules: [
                        {
                            type: 'evweek',
                            value: {
                                weekday: '3',
                                start: '2018-08-26'
                            }
                        }
                    ]
                },
                {
                    type: 'unburn',
                    schedules: [
                        {
                            type: 'biweek',
                            value: '3-1'
                        },
                        {
                            type: 'biweek',
                            value: '3-3'
                        }
                    ]
                },
                {
                    type: 'resource',
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
            const result = client.getAllSchedule(testdata);
            assert.equal(result[0].typeText,'burnable trash');
            assert.equal(result[0].schedules[0],'every other Wednseday');
            assert.equal(result[0].schedules[1],'10th of every month');
            assert.equal(result[1].typeText,'pokemon');
            assert.equal(result[1].schedules[0],'every Sunday');
            assert.equal(result[1].schedules[1],'2nd Friday');
            assert.equal(result[2].typeText,'plastic');
            assert.equal(result[3].typeText,'can');
            assert.equal(result[4].typeText,'paper');
            assert.equal(result[5].typeText,'bottle');
            assert.equal(result[6].typeText,'plastic bottle');
            assert.equal(result[7].typeText,'oversized trash');
            assert.equal(result[8].typeText,'unburnable trash');
            assert.equal(result[8].schedules[0],'1st Wednseday');
            assert.equal(result[8].schedules[1],'3rd Wednseday');
            assert.equal(result[9].typeText,'recyclble trash');
        });
    });
});

describe('calculateLocalTime',()=>{
    let stub;
    before(()=>{
        stub = sinon.stub(Date.prototype,'getTime');
        stub.withArgs().returns(1554298037605); //2019/4/3 13h
    });
    it('calculateTime',()=>{
        let dt;
        let client;
        client = new Client('en-US','America/Denver');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),7);

        client = new Client('en-US','America/Boise');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),7);

        client = new Client('en-US','America/Phoenix');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),6);

        client = new Client('en-US','America/Los_Angeles');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),6);

        client = new Client('en-US','America/Chicago');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),8);

        client = new Client('en-US','America/Indiana/Indianapolis');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),9);

        client = new Client('en-US','America/Detroit');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),9);

        client = new Client('en-US','America/New_York');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),9);

        client = new Client('en-US','America/Anchorage');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),5);

        client = new Client('en-US','Pacific/Honolulu');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),3);


        client = new Client('en-US','Asia/Tokyo');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),22);


        client = new Client('en-US','utc');
        dt = client.calculateLocalTime(0);
        assert.equal(dt.getHours(),13);
    });
    after(()=>{
        stub.restore();
    });
});

describe('Client,ja-JP',function(){
    let client;
    before(()=>{
        client = new Client('ja-JP','Asia/Tokyo');
    });
    describe('calculateLocalTime',function(){
        it('今日の日付',function(){
            let dt = client.calculateLocalTime(0);
            assert.equal(dt.getDate(),(new Date()).getDate());
            assert.equal(dt.getDay(),(new Date()).getDay());
        });

        it('明日の日付',function(){
            let dt = client.calculateLocalTime(1);
            var tommorow = (new Date(new Date().valueOf() + (24*60*60*1000)));
            assert.equal(dt.getDate(),tommorow.getDate());
            assert.equal(dt.getDay(),tommorow.getDay());
        });
    });

    describe('get_enable_trashes',function(){
        const testdata = [ { 'type': 'burn','trash_val': '', 'schedules': [ { 'type': 'weekday', 'value': '3' }, { 'type': 'weekday', 'value': '6' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'plastic', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '1' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'paper','trash_val': '', 'schedules': [ { 'type': 'none', 'value': '' }, { 'type': 'biweek', 'value': '1-2' }, { 'type': 'none', 'value': '' } ]}, { 'type': 'bottole', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'none', 'value': '' }, { 'type': 'none', 'value': '' } ] }, { 'type': 'petbottle', 'trash_val': '','schedules': [ { 'type': 'weekday', 'value': '4' }, { 'type': 'month', 'value': '11' }, { 'type': 'none', 'value': '' } ] } ];
        const client = new Client('ja-JP','Asia/Tokyo');
        it('weekday',function(){
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018/03/01'));

            try{
                let result = client.checkEnableTrashes(testdata,0);
                assert.equal(result.length,2);
                assert.equal('ビン、カン',result[0].trash_name);
                assert.equal('ペットボトル',result[1].trash_name);
            } finally{
                stub.restore();
            }

        });
        it('biweek',function(){
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018/03/12'));

            try{
                let result = client.checkEnableTrashes(testdata,0);
                assert.equal(2,result.length);
                assert.equal('プラスチック',result[0].trash_name);
                assert.equal('古紙',result[1].trash_name);
            } finally{
                stub.restore();
            }
        });
        it('month',function(){
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018/03/11'));

            try{
                let result = client.checkEnableTrashes(testdata,0);
                assert.equal(1,result.length);
                assert.equal('ペットボトル',result[0].trash_name);
            }finally{
                stub.restore();
            }
        });
        it('evweek',function(){
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018-09-26'));

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

            try{
                const result = client.checkEnableTrashes(testdata,0);
                assert.equal(result.length,3);
                assert.equal(result[0].trash_name,'もえるゴミ');
                assert.equal(result[1].trash_name,'プラスチック');
                assert.equal(result[2].trash_name,'ビン');
            }finally {
                stub.restore();
            }
        });
        it('none',function(){
            const client = new Client('ja-JP','Asia/Tokyo');
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018/03/04'));

            try{
                let result = client.checkEnableTrashes(testdata,0);
                assert.equal(0,result.length);
            } finally {
                stub.restore();
            }
        });
    });
    describe('get_enable_trashes 重複排除機能',function(){
        it('重複の排除',function(){
            let testdata = [
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
            ];
            const client = new Client('ja-JP','Asia/Tokyo');
            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018-09-29 00:00'));

            const response = client.checkEnableTrashes(testdata,0);
            assert.equal(response.length,1);

            stub.restore();
        });
        it('otherの場合はtrash_valが同じ場合のみ重複排除',function(){
            let testdata = [
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
            ];

            const stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2018-08-26 00:00'));

            let response = client.checkEnableTrashes(testdata,0);
            assert.equal(response.length,2);
            assert.equal(response[0].trash_name,'廃品');
            assert.equal(response[1].trash_name,'発泡スチロール');

            stub.restore();
        });
    });
    describe('getTrashData',function(){
        it('未登録のuuid',function(done){
            const client = new Client('ja-JP','Asia/Tokyo');
            client.getTrashData('1439d8b1-b41e-45f9-9afc-ecdfdaea1d83',0).then(()=>{}).catch((error)=>{
                assert.equal(error.message,'登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。');
                done();
            });
        });
    });
    describe('getTargetDayByWeekday',function(){
        let stub;
        let client;
        before(()=>{
            client = new Client('ja-JP','Asia/Tokyo');
            stub = sinon.stub(client,'calculateLocalTime');
            stub.withArgs(0).returns(new Date('2019/03/17'));
        });
        it('日曜日',function(){
            const target_day = client.getTargetDayByWeekday(0);
            assert.equal(target_day,7);
        });
        it('月曜日',function(){
            const target_day = client.getTargetDayByWeekday(1);
            assert.equal(target_day,1);
        });
        it('土曜日',function(){
            const target_day = client.getTargetDayByWeekday(6);
            assert.equal(target_day,6);
        });
        after(()=> {
            stub.restore();
        });
    });

    describe('getAllSchedule',()=>{
        it('全パターン検証',()=>{
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
                        },
                        {
                            type: 'month',
                            value: '10'
                        }
                    ]
                },
                {
                    type: 'other',
                    trash_val: '新運',
                    schedules: [
                        {
                            type: 'weekday',
                            value: '0'
                        },
                        {
                            type: 'biweek',
                            value: '5-2'
                        }
                    ]
                },
                {
                    type: 'plastic',
                    schedules: [
                        {
                            type: 'weekday',
                            value: '0'
                        }
                    ]
                },
                {
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
                },
                {
                    type: 'petbottle',
                    schedules: [
                        {
                            type: 'evweek',
                            value: {
                                weekday: '3',
                                start: '2018-08-26'
                            }
                        }
                    ]
                },
                {
                    type: 'coarse',
                    schedules: [
                        {
                            type: 'evweek',
                            value: {
                                weekday: '3',
                                start: '2018-08-26'
                            }
                        }
                    ]
                },
                {
                    type: 'unburn',
                    schedules: [
                        {
                            type: 'evweek',
                            value: {
                                weekday: '3',
                                start: '2018-08-26'
                            }
                        }
                    ]
                },
                {
                    type: 'resource',
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
            const client = new Client('ja-JP','Asia/Tokyo');
            const result = client.getAllSchedule(testdata);
            assert.equal(result[0].typeText,'もえるゴミ');
            assert.equal(result[0].schedules[0],'隔週水曜日');
            assert.equal(result[0].schedules[1],'毎月10日');
            assert.equal(result[1].typeText,'新運');
            assert.equal(result[1].schedules[0],'毎週日曜日');
            assert.equal(result[1].schedules[1],'第2金曜日');
            assert.equal(result[2].typeText,'プラスチック');
            assert.equal(result[3].typeText,'カン');
            assert.equal(result[4].typeText,'古紙');
            assert.equal(result[5].typeText,'ビン');
            assert.equal(result[6].typeText,'ペットボトル');
            assert.equal(result[7].typeText,'粗大ゴミ');
            assert.equal(result[8].typeText,'もえないゴミ');
            assert.equal(result[9].typeText,'資源ゴミ');
        });
    });
    describe('updateLastUsed',()=>{
        it('通常更新',(done)=>{
            const client = new Client('ja-JP','Asia/Tokyo');
            client.updateLastUsed('00b38bbe-8a0f-4afc-afa9-c00aaac1d1df').then(()=>{
                assert.ok(true);
            }).catch((error)=>{
                assert.fail(error);
            });
            done();
        });
    });
    describe('getDayFromTrashType',()=>{
        let client;
        before(()=>{
            client = new Client('ja-JP','Asia/Tokyo');
        });
        describe('weekday',()=>{
            const trashes = [
                {
                    type: 'burn',
                    schedules: [
                        {type:'weekday',value: '0'},
                        {type:'weekday',value: '6'},
                    ]
                }
            ];
            it('当日が日曜日',()=>{
                let stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/03/17'));
                const result = client.getDayFromTrashType(trashes,'burn');
                assert.equal(result.burn.list[0].getDate(),'17');
                assert.equal(result.burn.list[1].getDate(),'23');
                assert.equal(result.burn.recent.getDate(),'17');
                stub.restore();
            });
            it('当日が金曜日',()=>{
                let stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/03/15'));
                const result = client.getDayFromTrashType(trashes,'burn');
                assert.equal(result.burn.list[0].getDate(),'17');
                assert.equal(result.burn.list[1].getDate(),'16');
                assert.equal(result.burn.recent.getDate(),'16');
                stub.restore();
            });
        });
        describe('month',()=>{
            let stub;
            let client;
            before(()=>{
                client = new Client('ja-JP','Asia/Tokyo');
                stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/02/15'));
            });
            it('翌月1日設定/同月追加/同月追加後の翌月/同日',()=>{
                const trashes = [
                    {
                        type: 'burn',
                        schedules: [
                            {type: 'month',value: '1'},
                            {type: 'month',value: '17'},
                            {type: 'month',value: '31'},
                            {type: 'month',value: '15'}
                        ]
                    }
                ];
                const result = client.getDayFromTrashType(trashes,'burn');
                assert.equal(result.burn.list[0].getMonth()+1,'3');
                assert.equal(result.burn.list[1].getMonth()+1,'2');
                assert.equal(result.burn.list[2].getMonth()+1,'3');
                assert.equal(result.burn.list[3].getMonth()+1,'2');
                assert.equal(result.burn.recent.getDate(),'15');
            });
            after(()=>{
                stub.restore();
            });
        });
        describe('biweek',()=>{
            let stub;
            let client;
            before(()=>{
                client = new Client('ja-JP','Asia/Tokyo');
                stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/03/15'));
            });
            it('当日/翌週の同じ曜日/今週の違う曜日/翌週の違う曜日/再来週の違う曜日/翌月に繰越',()=>{
                const trashes = [
                    {
                        type: 'burn',
                        schedules: [
                            {type: 'biweek',value:'5-3'},
                            {type: 'biweek',value:'5-4'},
                            {type: 'biweek',value:'6-3'},
                            {type: 'biweek',value:'2-3'},
                            {type: 'biweek',value:'6-5'},
                            {type: 'biweek',value:'1-1'}
                        ]
                    }
                ];
                const result = client.getDayFromTrashType(trashes,'burn');
                assert.equal(result.burn.list[0].getDate(),'15') ;
                assert.equal(result.burn.list[1].getDate(),'22') ;
                assert.equal(result.burn.list[2].getDate(),'16') ;
                assert.equal(result.burn.list[3].getDate(),'19') ;
                assert.equal(result.burn.list[4].getDate(),'30') ;
                assert.equal(`${result.burn.list[5].getMonth()+1}-${result.burn.list[5].getDate()}`,'4-1') ;
                assert.equal(result.burn.recent.getDate(),'15');
            });
            after(()=>{
                stub.restore();
            });
        });
        describe('evweek',()=>{
            let stub;
            let client;
            before(()=>{
                client = new Client('ja-JP','Asia/Tokyo');
                stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/03/15'));
            });
            it('今週/翌週/当日',()=>{
                const trashes = [
                    {
                        type: 'burn',
                        schedules: [
                            {type: 'evweek',value:{weekday: '6',start:'2019-02-24'}},
                            {type: 'evweek',value:{weekday: '6',start:'2019-03-03'}},
                            {type: 'evweek',value:{weekday: '5',start:'2019-03-10'}}
                        ]
                    }
                ];
                const result = client.getDayFromTrashType(trashes,'burn');
                assert.equal(result.burn.list[0].getDate(),'16');
                assert.equal(result.burn.list[1].getDate(),'23');
                assert.equal(result.burn.list[2].getDate(),'15');
                assert.equal(result.burn.recent.getDate(),'15');
            });
            after(()=>{
                stub.restore();
            });
        });
        describe('nomatch',()=>{
            it('該当するごみが登録されていない',()=>{
                const trashes = [
                    {
                        type: 'burn',
                        schedules: [{type: 'weekday',value:'0'}]
                    }
                ];
                const result = client.getDayFromTrashType(trashes,'unburn');
                assert.equal(result.burn,undefined);
            });
        });
        describe('other match',()=>{
            let stub;
            let client;
            before(()=>{
                client = new Client('ja-JP','Asia/Tokyo');
                stub = sinon.stub(client,'calculateLocalTime');
                stub.withArgs(0).returns(new Date('2019/03/15'));
            });
            it('複数のother登録',()=>{
                const trashes = [
                    { type: 'other', trash_val: '金属', schedules: [{type: 'weekday',value:'5'},{type: 'month',value:'30'}] },
                    { type: 'other', trash_val: 'リソース', schedules: [{type: 'weekday',value:'5'},{type: 'month',value:'30'}] }
                ];
                const result = client.getDayFromTrashType(trashes,'other');
                assert.equal(result['金属'].list.length,2);
                assert.equal(result['リソース'].list.length,2);
                assert.equal(result['金属'].list[0].getDate(),'15');
                assert.equal(result['リソース'].list[0].getDate(),'15');
                assert.equal(result['金属'].recent.getDate(),'15');
                assert.equal(result['リソース'].recent.getDate(),'15');
            });
            after(()=>{
                stub.restore();
            });
        });
    });
});
