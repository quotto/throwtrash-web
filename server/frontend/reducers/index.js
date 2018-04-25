import {TrashType,ScheduleType} from '../components/ScheduleList'
import {ActionType} from '../actions'
import {combineReducers} from 'redux'
import _ from 'lodash'

const required = (value) => {
    return value ? undefined : '値を入力してください'
}

const number = value => {return value && isNaN(Number(value)) ? '数字を入力してください' : undefined}
const minValue = (value,min=1) => {
  return value && value < min ? `${min}以上の数字を入力してください` : undefined
}

const maxValue = (value,max=31) => {
    return value && value > max ? `${max}以下の数字を入力してください` : undefined
}

const error_check = (trashes) => {
    return trashes.some((trash) => {
        return trash.schedules.some((schedule) => {
            return schedule.error
        }) || schedule_exist(trash.schedules)
    })
}

const schedule_exist = (schedules) => {
    let result = schedules.some((element)=>{
        return (element.type!="none")
    })
    return result ? undefined : '一つ以上のスケジュールを設定してください'
}

const initialScheduleValue = {
    'weekday': '0',
    'biweek': '0-1',
    'month': ''
}

const initialSchedule = ()=>{
    return{
        type: 'none',
        value: '',
        error: undefined
    }
}

const createInitialTrash = ()=> {
    return {
        type: 'burn',
        schedules: [initialSchedule(),initialSchedule(),initialSchedule()],
        error: undefined
    }
}

export const initialState = {
    trashes: [createInitialTrash()],
    error: true
}

export const updateState = (state=initialState,action)=> {
    switch(action.type) {
        case ActionType.ADD_TRASH:
            var new_state = _.cloneDeep(state)
            new_state.trashes.push(createInitialTrash())
            return new_state
        case ActionType.CHANGE_TRASH:
            var new_state =_.cloneDeep(state)
            new_state.trashes[action.index].type=action.value
            return new_state
        case ActionType.CHANGE_SCHEDULE:
            var i = action.index[0]
            var j = action.index[1]

            var new_state = _.cloneDeep(state)
            new_state.trashes[i].schedules[j] = {
                type: action.value,
                value: initialScheduleValue[action.value]
            }
            new_state.trashes[i].error = schedule_exist(new_state.trashes[i].schedules)

            new_state.error = (action.value==='month' || error_check(new_state.trashes)) //スケジュールタイプが毎月の場合、値は未入力
            return new_state
        case ActionType.CHANGE_INPUT:
            var i = action.index[0]
            var j = action.index[1]

            var new_state = _.cloneDeep(state)

            var error = undefined
            if(new_state.trashes[i].schedules[j].type==="month") {
                [required,number,minValue,maxValue].some((validate)=>{
                    error = validate(action.value)
                    return error
                })
            }

            Object.assign(new_state.trashes[i].schedules[j],{value:action.value,error:error})
            new_state.error = error_check(new_state.trashes)
            return new_state
        case ActionType.DEL_TRASH:
            var new_state = _.cloneDeep(state)
            new_state.trashes.splice(action.index,1)
            new_state.error = error_check(new_state.trashes) || (new_state.trashes==0)
            return new_state
        case ActionType.SET_SUBMITTING:
            return Object.assign({},state,{submitting:action.value})
        default:
            return state
    }
}

const TrashScheduleApp = combineReducers({
    updateState
})

export default TrashScheduleApp
