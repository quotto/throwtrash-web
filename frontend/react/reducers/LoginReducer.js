import {ActionType} from '../actions';
import _ from 'lodash';


const LoginReducer = (state={signedIn: false, userInfo: null, signinDialog: false},action)=>{
    const new_state = _.cloneDeep(state);
    switch(action.type) {
    case ActionType.SET_USER_INFO: {
        new_state.userInfo=action.user_info;
        new_state. signedIn=true;
        break;
    }
    case ActionType.SIGN_OUT: {
        new_state.userInfo = undefined;
        new_state.signedIn = false;
        break;
    }
    case ActionType.SIGNIN_DIALOG: {
        new_state.signinDialog = action.open;
        break;
    }
    default:
        break;
    }
    return new_state;
};


export default LoginReducer;