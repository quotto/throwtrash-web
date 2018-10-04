export const ActionType = {
    ADD_TRASH: 'ADD_TRASH',
    CHANGE_TRASH: 'CHANGE_TRASH',
    CHANGE_SCHEDULE: 'CHANGE_SCHEDULE',
    CHANGE_INPUT: 'CHANGE_INPUT',
    INPUT_TRASH_TYPE: 'INPUT_TRASH_TYPE',
    DEL_TRASH: 'DEL_TRASH',
    SET_SUBMITTING: 'SET_SUBMITTING'
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

export const inputTrashType = (i,value) => {
    return {
        type: ActionType.INPUT_TRASH_TYPE,
        index: i,
        value: value
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
