const Util = require('../utility.js');
const assert = require('assert');
const sinon = require('sinon');

const testdata = [
    {
        type: 'bottle',
        trash_val: '',
        schedules: [
            {
                type: 'weekday',
                value: '1'
            },
            {
                type: 'montsh',
                value: '12'
            },
            {
                type: 'none',
                value: ''
            }
        ],
    },
    {
        type: 'other',
        trash_val: '新聞紙',
        schedules: [
            {
                type: 'evweek',
                value: {
                    week: '5',
                    start: 'thisweek'
                }
            }
        ],
        input_trash_error: undefined
    },
    {
        type: 'bin',
        trash_val: undefined,
        schedules: [
            {
                type: 'biweek',
                value: '2-1'
            },
            {
                type: 'evweek',
                value: {
                    week: '0',
                    start: 'nextweek'
                }
            }
        ]
    }
];

describe('create_id',()=> {
    it('create_id', ()=>{
        assert.equal(Util.create_id().length,36);
    });
});

describe('adjustData',()=>{
    let stub;
    before(()=>{
        stub = sinon.stub(Date.prototype, 'getTime');
        stub.withArgs().returns(1569801600000); //2019/09/30 00:00:00
    });
    it('adjustData', ()=>{
        const adjust_data = Util.adjustData(testdata, -540); // 日本時間想定
        assert.equal(
            JSON.stringify(adjust_data),
            JSON.stringify([{
                type: 'bottle',
                schedules: [
                    {
                        type: 'weekday',
                        value: '1'
                    },
                    {
                        type: 'montsh',
                        value: '12'
                    }
                ]
            },
            {
                type: 'other',
                trash_val: '新聞紙',
                schedules: [
                    {
                        type: 'evweek',
                        value: {
                            week: '5',
                            start: '2019-9-29'
                        }
                    }
                ],
            },
            {
                type: 'bin',
                schedules: [
                    {
                        type: 'biweek',
                        value: '2-1'
                    },
                    {
                        type: 'evweek',
                        value: {
                            week: '0',
                            start: '2019-10-6'
                        }
                    }
                ]
            }])
        );
    });
    after(()=>{
        stub.restore();
    });
});
