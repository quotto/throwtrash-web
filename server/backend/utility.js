
/**
 * ユーザーIDをランダムに生成する
 * @return {string} ユーザーID
 */
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

/**
 * ユーザーより送信されたゴミ出しスケジュールを最適化する
 * @param {object} : JSON形式のゴミ出しスケジュール
 * @param {int} offset : ユーザー地域のタイムゾーンオフセット
 */
exports.adjustData = (input_data, offset) => {
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
};
