import _ from 'lodash';
import {ActionType} from '../actions/index';

const TRASH_NAME = {
    burn: 'もえるゴミ',
    unburn: 'もえないゴミ',
    bin: 'ビン',
    can: 'カン',
    petbottle: 'ペットボトル',
    plastic: 'プラスチック',
    paper: '古紙',
    resource: '資源ゴミ',
    coarse: '粗大ゴミ'
};

const WEEKDAY_NAME = { 
    0: '日曜日',
    1: '月曜日',
    2: '火曜日',
    3: '水曜日',
    4: '木曜日',
    5: '金曜日',
    6: '土曜日'
};

const toScheduleText = (schedule_type, schedule_value) => {
    if(schedule_type === 'weekday'){
        return `毎週${WEEKDAY_NAME[schedule_value]}`;
    } else if(schedule_type === 'month'){
        return `毎月${schedule_value}日`;
    } else if(schedule_type === 'biweek') { 
        const num_of_week = schedule_value.split('-');
        return `第${num_of_week[1]}${WEEKDAY_NAME[num_of_week[0]]}`;
    } else if(schedule_type === 'evweek') {
        return `${schedule_value.interval}週に1度の${WEEKDAY_NAME[schedule_value.weekday]}`;
    }
    return '';
};

        

const toTrashName = (trash_type,trash_val) => {
    if(trash_type == 'other'){
        return trash_val;
    }
    return TRASH_NAME[trash_type];
};

const init_address_page_state = ()=> ({
    per_page: 5,
    current_page: 1,
    address_list: [],
});
const init_trash_page_state = ()=> ({
    per_page: 5,
    current_page: 1,
    trash_list: [],
    trash_text_list: [], // trash_listをUIに表示するためにテキスト化したもの
});

export const ZipcodeStatus = {
    None: 0,
    AddressSelect: 1,
    ResultSelect: 2
};

const ZipcodeReducer = (state = {
    zipcode: '', 
    submitting: false,
    status: ZipcodeStatus.None,
    address_page_state: init_address_page_state(),
    trash_page_state: init_trash_page_state(),
    error: undefined 
}, action) => {
    const new_state = Object.assign({}, state);
    switch(action.type) {
    case ActionType.SET_ZIPCODE_MESSAGE: 
        new_state.message = action.value;
        break;
    case ActionType.CHANGE_ZIPCODE:
        new_state.zipcode = action.zipcode;
        break;
    case ActionType.SUBMIT_ZIPCODE:
        new_state.submitting = action.status;
        break;
    case ActionType.CHANGE_ZIPCODE_STATUS:
        new_state.status = action.status;
        if(action.status === ZipcodeStatus.AddressSelect) {
            // 住所一覧はそのまま設定する
            new_state.address_page_state.address_list = _.cloneDeep(action.value);
        } else if(action.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.trash_list = _.cloneDeep(action.value);
            // ごみ出し予定一覧は生データ（JSON）なので表示用テキストに変換する
            new_state.trash_page_state.trash_text_list = action.value.map(trashes=>{
                const trash_text_list = [];
                trashes.forEach(trash=>{
                    const schedule_text_list = [];
                    trash.schedules.forEach(schedule=>{
                        schedule_text_list.push(toScheduleText(schedule.type, schedule.value));
                    });
                    trash_text_list.push(`${toTrashName(trash.type, trash.trash_val)}: ${schedule_text_list.join(',')}`);
                });
                return trash_text_list.join('/');
            });
        } else {
            new_state.address_page_state = init_address_page_state();
            new_state.trash_page_statei = init_trash_page_state();
        }
        // エラーの状態をリセットする
        new_state.error = undefined;
        break;
    case ActionType.ERROR_ZIPCODE:
        new_state.error = '一致するユーザーの情報が見つかりませんでした。';
        break;
    }
    return new_state;
};

export default ZipcodeReducer;