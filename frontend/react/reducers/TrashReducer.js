import {ActionType} from '../actions';
import _ from 'lodash';
import common_check from './common_check';

const initialScheduleValue = {
    'weekday': '0',
    'biweek': '0-1',
    'month': '',
    'evweek': {weekday: '0',start: new Date().toISOString().substr(0,10), interval: 2}
};

const initialSchedule = ()=>{
    return{
        type: 'weekday',
        value: '0',
        error: undefined
    };
};

const createInitialTrash = ()=> {
    return {
        type: 'burn',
        trash_val: '',
        schedules: [initialSchedule()],
        excludes: [],
        trash_type_error: undefined,
        input_trash_type_error: undefined,
        is_excludes_submitted: false,
        is_excludes_error: false,
    };
};

export const initialState = {
    trashes: [createInitialTrash()],
    error: false,
};

const TrashReducer = (state=initialState,action)=> {
    let new_state = _.cloneDeep(state);
    switch(action.type) {
    case ActionType.ADD_TRASH:{
        new_state.trashes.push(createInitialTrash());
        new_state.error = common_check.exist_error(new_state.trashes);
        return new_state;
    }
    case ActionType.CHANGE_TRASH:{
        Object.assign(new_state.trashes[action.index],{type:action.value,trash_val: '',input_trash_type_error: undefined});
        new_state.error = common_check.exist_error(new_state.trashes);
        return new_state;
    }
    case ActionType.CHANGE_SCHEDULE:{
        const i = action.index[0];
        const j = action.index[1];
        new_state.trashes[i].schedules[j] = {
            type: action.value,
            value: initialScheduleValue[action.value],
            error: undefined
        };
        new_state.trashes[i].trash_type_error = common_check.schedule_exist(new_state.trashes[i].schedules);
        new_state.error = common_check.exist_error(new_state.trashes); //スケジュールタイプが毎月の場合、値は未入力
        return new_state;
    }
    case ActionType.ADD_SCHEDULE: {
        const target_trash = new_state.trashes[action.trash_index];
        if(target_trash.schedules.length < 3) {
            new_state.trashes[action.trash_index].schedules.push(initialSchedule());
        }
        return new_state;
    }
    case ActionType.DEL_SCHEDULE: {
        const target_trash = new_state.trashes[action.trash_index];
        if(target_trash.schedules.length > 1) {
            new_state.trashes[action.trash_index].schedules.splice(action.schedule_index, 1);
        }
        return new_state;
    }
    case ActionType.CHANGE_INPUT:{
        const i = action.index[0];
        const j = action.index[1];
        let error = undefined;
        if(new_state.trashes[i].schedules[j].type==='month') {
            error = common_check.input_month_check(action.value);
        }
        Object.assign(new_state.trashes[i].schedules[j],{value:action.value,error:error});
        new_state.error = common_check.exist_error(new_state.trashes);
        return new_state;
    }
    case ActionType.INPUT_TRASH_TYPE:{
        Object.assign(new_state.trashes[action.index],{trash_val: action.value});
        Object.assign(new_state.trashes[action.index],{input_trash_type_error: common_check.input_trash_type_check(new_state.trashes[action.index],action.maxlength)});
        new_state.error = common_check.exist_error(new_state.trashes);
        return new_state;
    }
    case ActionType.DEL_TRASH:{
        new_state.trashes.splice(action.index,1);
        new_state.error = common_check.exist_error(new_state.trashes);
        return new_state;
    }
    case ActionType.SET_USER_INFO:
    case ActionType.SET_PRESET: 
    {
        if(action.preset.length > 0) {
            new_state.trashes = _.cloneDeep(action.preset);
            new_state.error = common_check.exist_error(new_state.trashes);
        }
        return new_state;
    }
    case ActionType.RESET_EXCLUDE_SUBMIT: {
        new_state.trashes[action.index].is_excludes_error = false;
        new_state.trashes[action.index].is_excludes_submitted = false;
        return new_state;
    }
    case ActionType.SUBMIT_EXCLUDE: {
        const check_result = new_state.trashes[action.index].excludes.every((value)=>{
            if(value.month >=1 && value.month <= 12 && value.date >= 1) {
                if((value.month == 2 && value.date <= 29) ||
                    ([1,3,5,7,8,9].includes(value.month) && value.date <= 31) || 
                    value.date <= 30) {
                    return true;
                }
            }
            return false;
        });
        if(check_result) {
            new_state.trashes[action.index].excludes = action.excludes;
        }
        // is_excludes_errorはtrue=エラー有りのため、check_resultを反転した値を格納する
        new_state.trashes[action.index].is_excludes_error = !check_result;
        new_state.trashes[action.index].is_excludes_submitted = check_result;
        return new_state;
    }
    default:
        return state;
    }
};

export default TrashReducer;