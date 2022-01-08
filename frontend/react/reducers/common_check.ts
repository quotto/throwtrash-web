import { Schedule, Trash } from "./TrashReducer";

const required = (value: boolean | string) => {
    return value ? undefined : 'missingvalue';//'値を入力してください';
};

const number = (value: number | string) => {
    return value && isNaN(Number(value)) ? 'wrongnumber': undefined;//'数字を入力してください'
};

const minValue = (value: number,min=1) => {
    return value < min ? 'wrongminnumber' : undefined;//`${min}以上の数字を入力してください`
};

const maxValue = (value: number,max=31) => {
    return value && value > max ? 'wrongmaxnumber' : undefined;//`${max}以下の数字を入力してください`
};

const maxLen = (value: string,max=10) => {
    return value.length > max ?  'wronglengthstring' : undefined;//`${max}文字以内で入力してください`
};

const trashtype_regex = (value: string) =>{
    const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠\s]+$/;
    return re.exec(value) ? undefined : 'wrongcharacter';//'英字、ひらがな、カタカナ、漢字、数字で入力してください。';
};

const input_month_check = (month_val: string) => {
    let error = undefined;
    error = required(month_val) || number(month_val) || minValue(Number(month_val)) ||  maxValue(Number(month_val));
    return error;
};

const input_trash_type_check = (trash: Trash,maxlength:number=10) => {
    if(trash.type === 'other') {
        return required(trash.trash_val) || trashtype_regex(trash.trash_val) || maxLen(trash.trash_val,maxlength);
    }
    return undefined;
};

const schedule_exist = (schedules: Schedule[]) => {
    let result = schedules.some((element)=>{
        return (element.type!='none');
    });
    return result ? undefined : 'missingschedule';//'一つ以上のスケジュールを設定してください';
};

const exist_error = (trashes: Trash[]) => {
    try {
        return (trashes.length === 0) || trashes.some((trash) => {
            return trash.schedules.some((schedule) => {
                if(schedule.type === 'month') {
                    return input_month_check(schedule.value as string);
                }
                return schedule.error;
            }) || schedule_exist(trash.schedules) || input_trash_type_check(trash);
        });
    } catch(err) {
        console.error(err);
        return true;
    }
};

export default {
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