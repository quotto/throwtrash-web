import _ from 'lodash';
import { Reducer } from 'react';
import { ACTION_TYPE, SubmitReducerAction} from '../actions';

export interface SubmitReducerState {
    showErrorDialog?: boolean,
    submitting: boolean
}

const SubmitReducer  = (state: SubmitReducerState={submitting:false, showErrorDialog:false}, action: SubmitReducerAction): SubmitReducerState => {
    const new_state = _.cloneDeep(state);
    switch(action.type) {
    case ACTION_TYPE.ERROR_DIALOG: {
        new_state.showErrorDialog=action.openDialog;
        new_state.submitting=false;
        break;
    }
    case ACTION_TYPE.SET_SUBMITTING: {
        new_state.submitting= action.value;
        new_state.showErrorDialog=false;
        break;
    }
    default:
        break;
    }
    return new_state;
};
export default SubmitReducer;