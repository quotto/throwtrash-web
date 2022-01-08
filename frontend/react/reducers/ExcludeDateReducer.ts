import _ from 'lodash';
import { ACTION_TYPE, ExcludeReducerAction } from '../actions/index';
import { Exclude } from './TrashReducer';
const initialExcludeDate: Exclude = {
    month: 1,
    date: 1
};

const initialState: ExcludeDateReducerState = {
    trashIndex: -1,
    excludes: [
        initialExcludeDate
    ]
};

export interface ExcludeDateReducerState {
    trashIndex: number,
    excludes: Exclude[]
}
const ExcludeDateReducer = (state: ExcludeDateReducerState = initialState, action: ExcludeReducerAction) => {
    const newState = Object.assign({}, state);
    switch (action.type) {
    case ACTION_TYPE.INIT_EXCLUDE:
        return {
            trashIndex: action.index,
            excludes: action.excludes && action.excludes.length > 0 ? _.cloneDeep(action.excludes) : [initialExcludeDate]
        };
    case ACTION_TYPE.ADD_EXCLUDE:
        if(newState.excludes.length < 10) {
            newState.excludes.push(initialExcludeDate);
        }
        return newState;
    case ACTION_TYPE.DEL_EXCLUDE:
        if(newState.excludes.length > 1) {
            newState.excludes.splice(action.index,1);
        }
        return newState;
    case ACTION_TYPE.CHANGE_EXCLUDE:
        newState.excludes[action.index] = {month: action.month, date: action.date};
        return newState;
    default:
        return state;
    }
};

export default ExcludeDateReducer;