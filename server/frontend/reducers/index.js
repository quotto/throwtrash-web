import {TrashType,ScheduleType} from '../components/ScheduleList'
import {ActionType} from '../actions'
import {combineReducers} from 'redux'
import _ from 'lodash'

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

const initialSchedule = {
    type: 'none',
    value: '',
    error: undefined
}

const createInitialTrash = ()=> {
    return {
        type: 'burn',
        schedules: [initialSchedule,initialSchedule,initialSchedule],
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

            var error = undefined
            action.validate.some((element)=>{
                error = element()
                return error
            })

            var new_schedule = Object.assign({},state.trashes[i].schedules[j],{
                value: action.value,
                error: error
            })

            var new_trashes = Object.assign([],state.trashes)
            new_trashes[i].schedules[j] = new_schedule
            return Object.assign({},state,{
                trashes: new_trashes,
                error: error_check(new_trashes)
            })
        case ActionType.DEL_TRASH:
            var new_trashes = Object.assign([],state.trashes)
            new_trashes.splice(action.index,1)
            return Object.assign({},state,{
                trashes: new_trashes,
                error: error_check(new_trashes) || new_trashes.length==0
            })
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
