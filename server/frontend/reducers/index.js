import {ActionType} from '../actions';
import {combineReducers} from 'redux';
import _ from 'lodash';
import common_check from '../../common_check';

const initialScheduleValue = {
    'weekday': '0',
    'biweek': '0-1',
    'month': '',
    'evweek': {weekday: '0',start:'thisweek'}
};

const initialSchedule = ()=>{
    return{
        type: 'none',
        value: '',
        error: undefined
    };
};

const createInitialTrash = ()=> {
    return {
        type: 'burn',
        trash_val: '',
        schedules: [initialSchedule(),initialSchedule(),initialSchedule()],
        trash_type_error: undefined,
        input_trash_type_error: undefined
    };
};

export const initialState = {
    trashes: [createInitialTrash()],
    line: false,
    error: true
};

export const updateState = (state=initialState,action)=> {
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
    case ActionType.SET_SUBMITTING:{
        return Object.assign({},state,{submitting:action.value});
    }
    case ActionType.CHECK_LINE: {
        return Object.assign({}, state, {line:action.checked});
    }
    default:
        return state;
    }
};

const TrashScheduleApp = combineReducers({
    updateState
});

export default TrashScheduleApp;
