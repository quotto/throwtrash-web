import {TrashType,ScheduleType} from '../components/ScheduleList'
import {ActionType} from '../actions'
import {combineReducers} from 'redux'

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

const initialState = {
    trashes: [createInitialTrash()],
    error: true
}

const updateState = (state=initialState,action)=> {
    switch(action.type) {
        case ActionType.ADD_TRASH:
            var new_trashes = Object.assign([],state.trashes)
            new_trashes.push(createInitialTrash())
            return (
                Object.assign({},state,{
                    trashes: new_trashes,
                    error: true
                })
            )
        case ActionType.CHANGE_TRASH:
            var new_trashes = Object.assign([],state.trashes)
            new_trashes[action.index].type=action.value
            return (
                Object.assign({},state,{
                    trashes: new_trashes
                })
            )
        case ActionType.CHANGE_SCHEDULE:
            var i = action.index[0]
            var j = action.index[1]

            var new_trashes = Object.assign([],state.trashes)
            new_trashes[i].schedules[j] = Object.assign({},initialSchedule,{
                type: action.value,
                value: initialScheduleValue[action.value]
            })
            new_trashes[i].error = schedule_exist(new_trashes[i].schedules)

            return Object.assign({},state,{
                trashes: new_trashes,
                error: action.value==='month' || error_check(new_trashes) //スケジュールタイプが毎月の場合、値は未入力
            })
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
            console.log("submitting")
            return Object.assign({},state,{submitting:action.value})
        case ActionType.SUBMIT_FORM:
            // console.log("submit")
            // new Promise((resolve,reject)=>{
            //     axios.post("/regist",JSON.stringify(state.trashes),{headers:{'Content-Type':'application/json'}})
            //             .then((response)=> {
            //                 console.log(response)
            //                 resolve(true)
            //             }).catch((error) =>{
            //                 console.log("error")
            //                 reject(false)
            //             })
            //     }).then(()=>{
            //         return Object.assign({},state,{submitting:true})})
            //     .catch(()=>{
            //         console.log("submit error")
            //         return Object.assign({},state,{submitting:false})})
            // return result
            // return Object.assign({},state,{submitting:result})
        default:
            return state
    }
}

const TrashScheduleApp = combineReducers({
    updateState
})

export default TrashScheduleApp
