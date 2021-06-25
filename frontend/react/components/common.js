export function getErrorMessage(props, message_id, params = []) {
    let message = message_id ? props.t(`error.${message_id}`) : undefined;
    if (message) {
        for (let i = 0; i < params.length; i++) {
            message = message.replace('%s', params[i]);
        }
    }
    return message;
}

export function isError(error) {
    return typeof(error) != 'undefined';
}

export const ScheduleTypeList = ['none','weekday','biweek','month','evweek'];

export const TrashTypeList = [
    'burn','unburn','plastic','bin','can','petbottle','paper','resource','coarse','other'
];
