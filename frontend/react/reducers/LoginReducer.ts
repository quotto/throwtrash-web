import { ACTION_TYPE, LoginReducerAction } from '../actions';
import _ from 'lodash';


export interface LoginReducerState {
    signedIn: boolean,
    userInfo: {name: string} | null,
    signinDialog: boolean
}
const LoginReducer = (state: LoginReducerState={signedIn: false, userInfo: null, signinDialog: false},action: LoginReducerAction)=>{
    const new_state = _.cloneDeep(state);
    switch(action.type) {
    case ACTION_TYPE.SET_USER_INFO: {
        new_state.userInfo=action.user_info;
        new_state.signedIn=true;
        break;
    }
    case ACTION_TYPE.SIGN_OUT: {
        new_state.userInfo = null;
        new_state.signedIn = false;
        break;
    }
    case ACTION_TYPE.SIGNIN_DIALOG: {
        new_state.signinDialog = action.open;
        break;
    }
    default:
        break;
    }
    return new_state;
};


export default LoginReducer;