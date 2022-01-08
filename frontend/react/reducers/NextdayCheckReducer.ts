import { ACTION_TYPE, NextdayCheckReducerAction } from '../actions';
export interface NextdayCheckReducerState {
    checked?: boolean
}
const NextdayCheckReducer = (state: NextdayCheckReducerState={checked: true}, action: NextdayCheckReducerAction): NextdayCheckReducerState=>{
    switch(action.type) {
    case ACTION_TYPE.CHECK_NEXTDAY:
        return { checked: action.value };
    default:
        return state;
    }
};

export default NextdayCheckReducer;