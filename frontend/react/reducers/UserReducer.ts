import { ACTION_TYPE, UserReducerAction } from '../actions';

export interface UserReducerState {
    notificationDialog?: boolean
}
const UserReducer = (state: UserReducerState={notificationDialog: false},action: UserReducerAction)=>{
    const new_state = Object.assign({}, state);
    switch (action.type) {
    case ACTION_TYPE.NOTIFICATION_DIALOG: {
        new_state.notificationDialog = action.open;
        break;
    }
    }
    return new_state;
};

export default UserReducer;