import {ActionType} from '../actions';

const SubmitReducer = (state={submitting:false, showErrorDialog:false}, action) => {
    switch(action.type) {
    case ActionType.ERROR_DIALOG: {
        return Object.assign({}, state, { showErrorDialog: action.open });
    }
    case ActionType.SET_SUBMITTING: {
        return Object.assign({}, state, { submitting: action.value });
    }
    default:
        return state;
    }
};
export default SubmitReducer;