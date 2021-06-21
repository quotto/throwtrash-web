import {ActionType} from '../actions';

const UserReducer = (state={notificationDialog: false},action)=>{
    const new_state = Object.assign({}, state);
    switch (action.type) {
    case ActionType.NOTIFICATION_DIALOG: {
        new_state.notificationDialog = action.open;
        break;
    }
    }
    return new_state;
};

export default UserReducer;