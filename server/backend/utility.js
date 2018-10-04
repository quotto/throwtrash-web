exports.create_id = ()=>{
    let uuid = '', i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += '-';
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};

/**
    params:offset 今週=0,来週=1
**/
const calculateStartDate = (offset) => {
    const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    // 開始日を日曜日にセットする
    var dt = new Date(jsttime);
    dt.setDate(dt.getDate() - dt.getDay() + (7 * offset));

    return `${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`;
};

/**
    DB登録用にデータを整形する
    params: input_data Webフォームから入力されたゴミ出しスケジュールのJSONデータ
**/
exports.adjustData = (input_data) => {
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
                    const offset = regist_schedule.value.start==='thisweek' ? 0 : 1;
                    const start_date = calculateStartDate(offset);
                    regist_schedule.value.start = start_date;
                }
                trash_schedules.push(regist_schedule);
            }
        });
        regist_trash.schedules = trash_schedules;
        regist_data.push(regist_trash);
    });
    return regist_data;
};
