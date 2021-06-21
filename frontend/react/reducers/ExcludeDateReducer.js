import {ActionType} from '../actions/index';
const initialExcludeDate = {
    month: 1,
    date: 1
};

const initialState = {
    trashIndex: -1,
    excludes: [
        initialExcludeDate
    ]
};

const ExcludeDateReducer = (state = initialState, action) => {
    const newState = Object.assign({}, state);
    switch (action.type) {
    case ActionType.INIT_EXCLUDE:
        return {
            trashIndex: action.index,
            excludes: action.excludes && action.excludes.length > 0 ? action.excludes : [initialExcludeDate]
        };
    case ActionType.ADD_EXCLUDE:
        if(newState.excludes.length < 10) {
            newState.excludes.push(initialExcludeDate);
        }
        return newState;
    case ActionType.DEL_EXCLUDE:
        if(newState.excludes.length > 1) {
            newState.excludes.splice(action.index,1);
        }
        return newState;
    case ActionType.CHANGE_EXCLUDE:
        newState.excludes[action.index] = {month: action.month, date: action.date};
        return newState;
    default:
        return state;
    }
};

export default ExcludeDateReducer;