const Util = require('./utility.js');
const assert = require('assert');

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
assert.equal(Util.create_id().length>1,true);
const adjust_data = Util.adjustData(testdata);
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
                    start: '2018-9-30'
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
                    start: '2018-10-7'
                }
            }
        ]
    }]));
