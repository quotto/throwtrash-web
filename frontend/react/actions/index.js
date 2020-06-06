export const ActionType = {
    ADD_TRASH: 'ADD_TRASH',
    CHANGE_TRASH: 'CHANGE_TRASH',
    CHANGE_SCHEDULE: 'CHANGE_SCHEDULE',
    CHANGE_INPUT: 'CHANGE_INPUT',
    INPUT_TRASH_TYPE: 'INPUT_TRASH_TYPE',
    DEL_TRASH: 'DEL_TRASH',
    ERROR_DIALOG: 'ERROR_DIALOG',
    SET_SUBMITTING: 'SET_SUBMITTING',
    SET_USER_INFO: 'SET_USER_INFO',
    SIGN_OUT: 'SIGN_OUT',
    SIGNIN_DIALOG: 'SIGNIN_DIALOG',
    MENU_CHANGE: 'MENU_CHANGE',
    NOTIFICATION_DIALOG: 'NOTIFICATION_DIALOG'
};

export const addTrash = () => {
    return {
        type: ActionType.ADD_TRASH
    };
};

export const changeSchedule = (i,j,value) => {
    return {
        type: ActionType.CHANGE_SCHEDULE,
        index: [i,j],
        value: value
    };
};

export const changeTrashType = (i,value,validate) => {
    return {
        type: ActionType.CHANGE_TRASH,
        index: i,
        value: value,
        validate: validate
    };
};

export const changeInput = (i,j,value) => {
    return {
        type: ActionType.CHANGE_INPUT,
        index: [i,j],
        value: value
    };
};

export const inputTrashType = (i,value,maxlength) => {
    return {
        type: ActionType.INPUT_TRASH_TYPE,
        index: i,
        value: value,
        maxlength: maxlength
    };
};

export const deleteTrash = (i) => {
    return {
        type: ActionType.DEL_TRASH,
        index: i
    };
};

export const setSubmitting = (status)=> {
    return {
        type: ActionType.SET_SUBMITTING,
        value: status
    };
};

export const setUserInfo = (user_info, preset)=>{
    return {
        type: ActionType.SET_USER_INFO,
        user_info: user_info,
        preset: preset
    };
};

export const signOut = ()=>{
    return {
        type: ActionType.SIGN_OUT
    };
};

export const errorDialog = (open)=>{
    return {type: ActionType.ERROR_DIALOG, open:open};
};

export const signinDialog =(value)=>{
    return {type: ActionType.SIGNIN_DIALOG,open: value};
};

export const changeMenu = (value,target)=>{
    return {
        type:ActionType.MENU_CHANGE,
        open: value,
        anchorEl: target
    };
};

export const notificationDialog= (value)=> {
    return {type: ActionType.NOTIFICATION_DIALOG, open: value};
};