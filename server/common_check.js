const required = (value) => {
    return value ? undefined : '値を入力してください';
}

const number = value => {
    return value && isNaN(Number(value)) ? '数字を入力してください' : undefined;
}

const minValue = (value,min=1) => {
  return value && value < min ? `${min}以上の数字を入力してください` : undefined;
}

const maxValue = (value,max=31) => {
    return value && value > max ? `${max}以下の数字を入力してください` : undefined;
}

const maxLen = (value,max=10) => {
    return value.length > 10 ? `${max}文字以内で入力してください` : undefined;
}

const trashtype_regex = (value) =>{
    const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠]+$/;
    return re.exec(value) ? undefined : '英字、ひらがな、カタカナ、漢字、数字で入力してください。';
}

const input_month_check = (month_val) => {
    let error = undefined;
    [required,number,minValue,maxValue].some((validate)=>{
        error =  validate(month_val);
        return error;
    })
    return error;
}

const input_trash_type_check = (trash) => {
    if(trash.type === 'other') {
        return required(trash.trash_val) || trashtype_regex(trash.trash_val) || maxLen(trash.trash_val);
    }
    return undefined;
}

const schedule_exist = (schedules) => {
    let result = schedules.some((element)=>{
        return (element.type!="none");
    })
    return result ? undefined : '一つ以上のスケジュールを設定してください';
}

const exist_error = (trashes) => {
    return (trashes.length === 0) || trashes.some((trash) => {
        return trash.schedules.some((schedule) => {
            if(schedule.type === 'month') {
                return input_month_check(schedule.value);
            }
            return schedule.error
        }) || schedule_exist(trash.schedules) || input_trash_type_check(trash);
    });
}

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
}
