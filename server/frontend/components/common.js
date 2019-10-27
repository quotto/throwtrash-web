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

export const ScheduleType = ['none','weekday','biweek','month','evweek'];