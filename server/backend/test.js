const Util = require('./utility.js')

const test_data1 = [
    {
        type: "burn",
        schedules: [
            {
                type: "weekday",
                value: "1"
            },
            {
                type: "month",
                value: "11"
            }
        ]
    },
    {
        type: "bottle",
        schedules: [
            {
                type: "biweek",
                value: "0-2"
            }
        ]
    }
]

const test_data2=[
  {
    "type": "burn",
    "schedules": [
      {
        "type": "weekday",
        "value": "0"
      },
      {
        "type": "none",
        "value": ""
      },
      {
        "type": "none",
        "value": ""
      }
    ]
  },
  {
    "type": "bottole",
    "schedules": [
      {
        "type": "none"
      },
      {
        "type": "biweek",
        "value": "0-2"
      },
      {
        "type": "none",
        "value": ""
      }
    ]
  },
  {
    "type": "petbottle",
    "schedules": [
      {
        "type": "biweek",
        "value": "1-4"
      },
      {
        "type": "month",
        "value": "16"
      },
      {
        "type": "none",
        "value": ""
      }
    ]
  },
  {
    "type": "resource",
    "schedules": [
      {
        "type": "month",
        "value": "4"
      },
      {
        "type": "none",
        "value": ""
      },
      {
        "type": "none",
        "value": ""
      }
    ]
  },
  {
    "type": "coarse",
    "schedules": [
      {
        "type": "weekday",
        "value": "2"
      },
      {
        "type": "biweek",
        "value": "1-5"
      },
      {
        "type": "none",
        "value": ""
      }
    ]
  }
]

const test_data3 = [
    {
        type: "burn",
        schedules: [
            {
                type: "weekday",
                value: "1"
            },
            {
                type: "month",
                value: "11"
            }
        ]
    },
    {
        type: "burn",
        schedules: [
            {
                type: "biweek",
                value: "0-2"
            }
        ]
    },
    {
        type: "bottle",
        schedules: [
            {
                type: "weekday",
                value: "1"
            },
            {
                type: "month",
                value: "12"
            }
        ]
    },
    {
        type: "bottle",
        schedules: [
            {
                type: "weekday",
                value: "1"
            },
            {
                type: "month",
                value: "12"
            }
        ]
    }
]

const testdata4 = [
    {
        type: "bottle",
        trash_val: '',
        schedules: [
            {
                type: "weekday",
                value: "1"
            },
            {
                type: "montsh",
                value: "12"
            },
            {
                type: "none",
                value: ''
            }
        ],
    },
    {
        type: "other",
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
        type: 'week',
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
console.log(Util.create_id());
console.log(JSON.stringify(Util.adjustData(testdata4)));
