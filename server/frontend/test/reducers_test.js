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
        assert.deepEqual(multiInitialState,state)
    })
    describe("change trash",()=>{
        it("single trash",()=>{
            let except = _.cloneDeep(initialState)
            except.trashes[0].type='bin'
            const state = updateState(initialState,{type:ActionType.CHANGE_TRASH,value:"bin",index:0})
            assert.deepEqual(except,state)
        })
        it("multi trash",()=>{
            let except = _.cloneDeep(multiInitialState)
            except.trashes[1].type="bin"
            const state = updateState(multiInitialState,{type:ActionType.CHANGE_TRASH,value:"bin",index:1})
            assert.deepEqual(except,state)
        })
    })
    describe("change schedule",()=>{
        it("single trash",()=>{
            let except = _.cloneDeep(initialState)
            except.trashes[0].schedules[1] = {type: "month",value:""}
            except.error = true //monthの場合は入力必須のため初期状態はエラー
            const state = updateState(initialState,{type:ActionType.CHANGE_SCHEDULE,index:[0,1],value:"month"})
            assert.deepEqual(except,state)
        })
        it("multi trash",()=>{
            let except = _.cloneDeep(multiInitialState)
            except.trashes[0].schedules[2] = {type: "biweek",value:"0-1"}
            except.trashes[1].schedules[1] = {type: "weekday",value:"0"}
            except.error = false //month以外は初期値が設定されるのでエラー無し
            let state = updateState(multiInitialState,{type:ActionType.CHANGE_SCHEDULE,index:[0,2],value:"biweek"})
            state = updateState(state,{type:ActionType.CHANGE_SCHEDULE,index:[1,1],value:"weekday"})
            assert.deepEqual(except,state)
        })
    })
    describe("change input",()=>{
        it("single trash",()=>{
            let except = _.cloneDeep(initialState)
            Object.assign(except.trashes[0].schedules[0],{type:"month",value:"13",error:undefined})
            except.error=false

            let teststate = _.cloneDeep(initialState)
            Object.assign(teststate.trashes[0].schedules[0],{type:"month"})

            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,0],value:"13"})
            assert.deepEqual(except,state)
        })
        it("multi trash",()=>{
            let except = _.cloneDeep(multiInitialState)
            except.trashes[0].schedules[1]={type:"biweek",value:"1-1",error:undefined}
            except.trashes[1].schedules[2]={type:"week",value:"3",error:undefined}
            except.error=false

            let teststate = _.cloneDeep(multiInitialState)
            Object.assign(teststate.trashes[0].schedules[1],{type:"biweek",value:"0-1"})
            Object.assign(teststate.trashes[1].schedules[2],{type:"week",value:"3"})

            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:"1-1"})
            assert.deepEqual(except,state)
        })
        it("required error",()=>{
            let except = "値を入力してください"
            let teststate = _.cloneDeep(initialState)
            teststate.trashes[0].schedules[1].type = "month"
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:""})
            assert.equal(except,state.trashes[0].schedules[1].error)
            assert.equal(true,state.error)
        })
        it("number error",()=>{
            let except = "数字を入力してください"
            let teststate = _.cloneDeep(initialState)
            teststate.trashes[0].schedules[1].type = "month"
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:"a"})
            assert.equal(except,state.trashes[0].schedules[1].error)
            assert.equal(true,state.error)
        })
        it("min error",()=>{
            let except = "1以上の数字を入力してください"
            let teststate = _.cloneDeep(initialState)
            teststate.trashes[0].schedules[1].type = "month"
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:"0"})
            assert.equal(except,state.trashes[0].schedules[1].error)
            assert.equal(true,state.error)
        })
        it("max error",()=>{
            let except = "31以下の数字を入力してください"
            let teststate = _.cloneDeep(initialState)
            teststate.trashes[0].schedules[1].type = "month"
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:"32"})
            assert.equal(except,state.trashes[0].schedules[1].error)
            assert.equal(true,state.error)
        })
    })
    describe("delete trash",()=>{
        it("multi to single",()=>{
            let state = updateState(multiInitialState,{type:ActionType.DEL_TRASH,index:0})
            assert.deepEqual(initialState,state)
        })
        it("single to zero",()=>{
            let state = updateState(initialState,{type:ActionType.DEL_TRASH,index:0})
            assert.equal(0,state.trashes.length)
        })
        it("multi delete",()=>{
            let teststate = _.cloneDeep(multiInitialState)
            teststate.trashes[0].type="paper"
            let except = _.cloneDeep(initialState)
            except.trashes[0].type="paper"
            let state = updateState(teststate,{type:ActionType.DEL_TRASH,index:1})
            assert.deepEqual(except,state)
        })
    })
    describe("submitting",()=>{
        it("submit true",()=>{
            let state = updateState(initialState,{type:ActionType.SET_SUBMITTING,value:true})
            assert.equal(true,state.submitting)
        })
        it("submit false",()=>{
            let state = updateState(initialState,{type:ActionType.SET_SUBMITTING,value:false})
            assert.equal(false,state.submitting)
        })
    })
})
