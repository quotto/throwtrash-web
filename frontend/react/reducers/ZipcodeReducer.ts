import _ from 'lodash';
import { ACTION_TYPE, ZipReducerAction } from '../actions/index';
import { EvWeek, Trash } from './TrashReducer';

const TRASH_NAME: {[key:string]: string} = {
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

const WEEKDAY_NAME: {[key:string]: string} = {
    0: '日曜日',
    1: '月曜日',
    2: '火曜日',
    3: '水曜日',
    4: '木曜日',
    5: '金曜日',
    6: '土曜日'
};

const toScheduleText = (schedule_type: string, schedule_value: string | EvWeek) => {
    if(schedule_type === 'weekday'){
        return `毎週${WEEKDAY_NAME[schedule_value as string]}`;
    } else if(schedule_type === 'month'){
        return `毎月${schedule_value}日`;
    } else if(schedule_type === 'biweek') {
        const num_of_week = (schedule_value as string).split('-');
        return `第${num_of_week[1]}${WEEKDAY_NAME[num_of_week[0]]}`;
    } else if(schedule_type === 'evweek') {
        return `${((schedule_value as EvWeek).interval)}週に1度の${WEEKDAY_NAME[(schedule_value as EvWeek).weekday]}`;
    }
    return '';
};



const toTrashName = (trash_type: string,trash_val: string) => {
    if(trash_type == 'other'){
        return trash_val;
    }
    return TRASH_NAME[trash_type];
};

const init_address_page_state = ()=> ({
    per_page: 5,
    current_page: 0,
    address_list: [],
});
const init_trash_page_state = ()=> ({
    per_page: 5,
    current_page: 0,
    trash_list: [],
    trash_text_list: [], // trash_listをUIに表示するためにテキスト化したもの
});

export const ZipcodeStatus = {
    None: 0,
    AddressSelect: 1,
    ResultSelect: 2
};

interface AddressPageState {
    per_page: number,
    current_page: number,
    address_list: string[],
}

interface TrashPageState {
    per_page: number,
    current_page: number,
    trash_list: Trash[][],
    trash_text_list: string[], // trash_listをUIに表示するためにテキスト化したもの
}

export interface  ZipcodeReducerState {
    zipcode: string,
    submitting: boolean,
    status: number,
    address_page_state: AddressPageState,
    trash_page_state: TrashPageState,
    error?: string,
    message?: string
}

const ZipcodeReducer = (state: ZipcodeReducerState = {
    zipcode: '',
    submitting: false,
    status: ZipcodeStatus.None,
    address_page_state: init_address_page_state(),
    trash_page_state: init_trash_page_state(),
    error: undefined
}, action: ZipReducerAction) => {
    const new_state = Object.assign({}, state);
    switch(action.type) {
    case ACTION_TYPE.SET_ZIPCODE_MESSAGE:
        new_state.message = action.message;
        break;
    case ACTION_TYPE.CHANGE_ZIPCODE:
        new_state.zipcode = action.zipcode;
        break;
    case ACTION_TYPE.SUBMIT_ZIPCODE:
        new_state.submitting = action.status;
        break;
    case ACTION_TYPE.CHANGE_ZIPCODE_STATUS:
        new_state.status = action.status;
        if(action.status === ZipcodeStatus.AddressSelect) {
            // 住所一覧はそのまま設定する
            new_state.address_page_state.address_list = _.cloneDeep(action.value as string[]);
        } else if(action.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.trash_list = _.cloneDeep(action.value as Trash[][]);
            // ごみ出し予定一覧は生データ（JSON）なので表示用テキストに変換する
            new_state.trash_page_state.trash_text_list = (action.value as Trash[][]).map(trashes=>{
                const trash_text_list: string[] = [];
                trashes.forEach(trash=>{
                    const schedule_text_list: string[] = [];
                    trash.schedules.forEach(schedule=>{
                        schedule_text_list.push(toScheduleText(schedule.type, schedule.value));
                    });
                    trash_text_list.push(`${toTrashName(trash.type, trash.trash_val)}: ${schedule_text_list.join(',')}`);
                });
                return trash_text_list.join('/');
            });
        } else {
            new_state.address_page_state = init_address_page_state();
            new_state.trash_page_state = init_trash_page_state();
        }
        // エラーの状態をリセットする
        new_state.error = undefined;
        break;
    case ACTION_TYPE.ERROR_ZIPCODE:
        new_state.error = '一致するユーザーの情報が見つかりませんでした。';
        break;
    case ACTION_TYPE.CHANGE_PAGE:
        if(state.status === ZipcodeStatus.AddressSelect) {
            new_state.address_page_state.current_page = action.page;
        } else if(state.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.current_page = action.page;
        }
        break;
    case ACTION_TYPE.CHANGE_PER_PAGE:
        if(state.status === ZipcodeStatus.AddressSelect) {
            new_state.address_page_state.per_page = action.per_page;
        } else if(state.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.per_page = action.per_page;
        }
        break;
    }
    return new_state;
};

export default ZipcodeReducer;