export const ActionType = {
    ADD_TRASH: 'ADD_TRASH',
    CHANGE_TRASH: 'CHANGE_TRASH',
    CHANGE_SCHEDULE: 'CHANGE_SCHEDULE',
    ADD_SCHEDULE: 'ADD_SCHEDULE',
    DEL_SCHEDULE: 'DELETE_SCHEDULE',
    CHANGE_INPUT: 'CHANGE_INPUT',
    INPUT_TRASH_TYPE: 'INPUT_TRASH_TYPE',
    DEL_TRASH: 'DEL_TRASH',
    ERROR_DIALOG: 'ERROR_DIALOG',
    SET_SUBMITTING: 'SET_SUBMITTING',
    SET_USER_INFO: 'SET_USER_INFO',
    SIGN_OUT: 'SIGN_OUT',
    SIGNIN_DIALOG: 'SIGNIN_DIALOG',
    MENU_CHANGE: 'MENU_CHANGE',
    NOTIFICATION_DIALOG: 'NOTIFICATION_DIALOG',
    ADD_EXCLUDE: 'ADD_EXCLUDE',
    DEL_EXCLUDE: 'DEL_EXCLUDE',
    SUBMIT_EXCLUDE: 'SUBMIT_EXCLUDE',
    CHANGE_EXCLUDE: 'CHANGE_EXCLUDE',
    INIT_EXCLUDE: 'INIT_EXCLUDE',
    RESET_EXCLUDE_SUBMIT: 'RESET_EXCLUDE_SUBMIT',
    CHANGE_ZIPCODE: 'CHANGE_ZIPCODE',
    SET_ZIPCODE_MESSAGE: 'SET_ZIP_CODE_MESSAGE',
    SUBMIT_ZIPCODE: 'SUBMIT_ZIPCODE',
    CHANGE_ZIPCODE_STATUS: 'CHANGE_ZIPCODE_STATUS',
    ERROR_ZIPCODE: 'ERROR_ZIPCODE',
    SET_PRESET: 'SET_PRESET',
    CHANGE_PAGE: 'CHANGE_PAGE',
    CHANGE_PER_PAGE: 'CHANGE_PER_PAGE',
    CHECK_NEXTDAY: 'CHECK_NEXTDAY'
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

export const addSchedule = (trash_index) => {
    return {
        type: ActionType.ADD_SCHEDULE,
        trash_index: trash_index
    };
};

export const deleteSchedule = (trash_index, schedule_index) => {
    return {
        type: ActionType.DEL_SCHEDULE,
        trash_index,
        schedule_index
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

export const addExcludeDate = ()=> {
    return {type: ActionType.ADD_EXCLUDE};
};

export const deleteExcludeDate = (index)=> {
    return {type: ActionType.DEL_EXCLUDE, index: index};
};

export const submitExcludeDate = (index, excludes)=> {
    return {type: ActionType.SUBMIT_EXCLUDE, index: index, excludes: excludes};
};

export const changeExcludeDate = (index, month, date)=>{
    return {type: ActionType.CHANGE_EXCLUDE, index: index, month: month, date: date};
};

export const initExcludeDate = (index, excludes) => {
    return {
        type: ActionType.INIT_EXCLUDE,
        index: index,
        excludes: excludes
    };
};

export const resetExcludeSubmit = (index) => {
    return {
        type: ActionType.RESET_EXCLUDE_SUBMIT,
        index: index
    };
};

export const setZipcodeMessage = (message) => {
    return {
        type: ActionType.SET_ZIPCODE_MESSAGE,
        message: message
    };
};

export const changeZipcode = (value) => (
    {
        type: ActionType.CHANGE_ZIPCODE,
        zipcode: value
    }
);

export const submitZipcode = (submit) => (
    {
        type: ActionType.SUBMIT_ZIPCODE,
        status: submit //true: サブミット中, false: 検索可能
    }
);

export const changeZipcodeStatus = (status, value) => (
    {
        type: ActionType.CHANGE_ZIPCODE_STATUS,
        status: status,
        value: value // アドレス一覧選択の場合は住所リスト,ゴミ出し予定選択の場合はゴミ出し予定のリスト,通常状態なら値無し(空のリスト)
    }
);

export const setErrorZipcode = () => (
    {
        type: ActionType.ERROR_ZIPCODE
    }
);

export const setPreset = (preset) => (
    {
        type: ActionType.SET_PRESET,
        preset: preset
    }
);

export const changePage = (page) => (
    {
        type: ActionType.CHANGE_PAGE,
        page: page
    }
);

export const changePerPage = (per_page) => (
    {
        type: ActionType.CHANGE_PER_PAGE,
        per_page: per_page
    }
);

export const changeNextdayCheck = (checked) => (
    {
        type: ActionType.CHECK_NEXTDAY,
        value: checked
    }
);