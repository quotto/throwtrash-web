const required = (value) => {
    return value ? undefined : 'missingvalue';//'値を入力してください';
};

const number = value => {
    return value && isNaN(Number(value)) ? 'wrongnumber': undefined;//'数字を入力してください'
};

const minValue = (value,min=1) => {
    return value && value < min ? 'wrongminnumber' : undefined;//`${min}以上の数字を入力してください`
};

const maxValue = (value,max=31) => {
    return value && value > max ? 'wrongmaxnumber' : undefined;//`${max}以下の数字を入力してください`
};

const maxLen = (value,max=10) => {
    return value.length > max ?  'wronglengthstring' : undefined;//`${max}文字以内で入力してください`
};

const trashtype_regex = (value) =>{
    const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠\s]+$/;
    return re.exec(value) ? undefined : 'wrongcharacter';//'英字、ひらがな、カタカナ、漢字、数字で入力してください。';
};

const input_month_check = (month_val) => {
    let error = undefined;
    [required,number,minValue,maxValue].some((validate)=>{
        error =  validate(month_val);
        return error;
    });
    return error;
};

const input_trash_type_check = (trash,maxlength) => {
    if(trash.type === 'other') {
        return required(trash.trash_val) || trashtype_regex(trash.trash_val) || maxLen(trash.trash_val,maxlength);
    }
    return undefined;
};

const schedule_exist = (schedules) => {
    let result = schedules.some((element)=>{
        return (element.type!='none');
    });
    return result ? undefined : 'missingschedule';//'一つ以上のスケジュールを設定してください';
};

const exist_error = (trashes) => {
    try {
        return (trashes.length === 0) || trashes.some((trash) => {
            return trash.schedules.some((schedule) => {
                if(schedule.type === 'month') {
                    return input_month_check(schedule.value);
                }
                return schedule.error;
            }) || schedule_exist(trash.schedules) || input_trash_type_check(trash);
        });
    } catch(err) {
        console.error(err);
        return true;
    }
};

module.exports = {
    required: required,
    number: number,
    minValue: minValue,
    maxValue: maxValue,
    schedule_exist: schedule_exist,
    input_month_check: input_month_check,
    input_trash_type_check: input_trash_type_check,
    trashtype_regex: trashtype_regex,
    exist_error: exist_error
};
