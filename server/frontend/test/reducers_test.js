import {updateState,initialState} from '../reducers/index.js'
import {ActionType} from '../actions/index.js'
const assert = require('assert')
const assign_deep = require('assign-deep')
const _ = require('lodash')

let multiInitialState = _.cloneDeep(initialState)
multiInitialState.trashes.push(_.cloneDeep(initialState.trashes[0]))


describe('updateState',()=>{
    it("Add Trash Type",()=>{
        const state = updateState(initialState,{type:ActionType.ADD_TRASH})
        console.log(state)
        assert.deepEqual(
            {
                trashes:[
                    {
                        type:'burn',
                        schedules:[
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            },
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            },
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            }
                        ],
                        error: undefined
                    },
                    {
                        type:'burn',
                        schedules:[
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            },
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            },
                            {
                                type:'none',
                                value:'',
                                error:undefined
                            }
                        ],
                        error: undefined
                    }
                ],
                error:true
            },
            state
        )
    })
    describe("change trash",()=>{
        it("single",()=>{
            let except = _.cloneDeep(initialState)
            except.trashes[0].type='bin'
            const state = updateState(initialState,{type:ActionType.CHANGE_TRASH,value:"bin",index:0})
            assert.deepEqual(except,state)
        })
        it("multi",()=>{
            let except = _.cloneDeep(multiInitialState)
            except.trashes[1].type='bin'
            const state = updateState(multiInitialState,{type:ActionType.CHANGE_TRASH,value:"bin",index:1})
            assert.deepEqual(except,state)
        })
    })
    describe("change schedule",()=>{
        it("single",()=>{
            let except = _.cloneDeep(initialState)
            except.trashes[0].schedules[1] = {type: "month",value:""}
            const state = updateState(initialState,{type:ActionType.CHANGE_SCHEDULE,index:[0,1],value:"month"})
            assert.deepEqual(except,state)
        })
        it("multi",()=>{
            let except = _.cloneDeep(multiInitialState)
            except.trashes[0].schedules[2] = {type: "biweek",value:"0-1"}
            except.trashes[1].schedules[1] = {type: "weekday",value:"0"}
            except.error = false
            let state = updateState(multiInitialState,{type:ActionType.CHANGE_SCHEDULE,index:[0,2],value:"biweek"})
            state = updateState(state,{type:ActionType.CHANGE_SCHEDULE,index:[1,1],value:"weekday"})
            assert.deepEqual(except,state)
        })

    })
})
