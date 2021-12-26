import { ActionType } from '../actions';

const NextdayCheckReducer = (state={checked: true}, action)=>{
    switch(action.type) {
    case ActionType.CHECK_NEXTDAY:
        return { checked: action.value };
    default:
        return state;
    }
};

export default NextdayCheckReducer;