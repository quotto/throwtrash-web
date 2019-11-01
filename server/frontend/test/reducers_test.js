import {updateState,SubmitState,initialState} from '../reducers/index.js';
import {ActionType} from '../actions/index.js';
const assert = require('assert');
const _ = require('lodash');

let multiInitialState = _.cloneDeep(initialState);
multiInitialState.trashes.push(_.cloneDeep(initialState.trashes[0]));


describe('updateState',()=>{
    it('Add Trash Type',()=>{
        const state = updateState(undefined,{type:ActionType.ADD_TRASH});
        assert.deepEqual(multiInitialState,state);
    });
    describe('change trash',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='bin';
            const state = updateState(undefined,{type:ActionType.CHANGE_TRASH,value:'bin',index:0});
            assert.deepEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            except.trashes[1].type='bin';
            const state = updateState(multiInitialState,{type:ActionType.CHANGE_TRASH,value:'bin',index:1});
            assert.deepEqual(except,state);
        });
    });
    describe('change schedule',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0].schedules[1],{type: 'month',value:''});
            except.error = true; //monthの場合は入力必須のため初期状態はエラー
            const state = updateState(undefined,{type:ActionType.CHANGE_SCHEDULE,index:[0,1],value:'month'});
            assert.deepEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            Object.assign(except.trashes[0].schedules[2],{type: 'biweek',value:'0-1'});
            Object.assign(except.trashes[1].schedules[1],{type: 'weekday',value:'0'});
            except.error = false; //month以外は初期値が設定されるのでエラー無し
            let state = updateState(multiInitialState,{type:ActionType.CHANGE_SCHEDULE,index:[0,2],value:'biweek'});
            state = updateState(state,{type:ActionType.CHANGE_SCHEDULE,index:[1,1],value:'weekday'});
            assert.deepEqual(except,state);
        });
    });
    describe('change input',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0].schedules[0],{type:'month',value:'13',error:undefined});
            except.error=false;

            let teststate = _.cloneDeep(initialState);
            Object.assign(teststate.trashes[0].schedules[0],{type:'month'});

            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,0],value:'13'});
            assert.deepEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            Object.assign(except.trashes[0].schedules[1],{type:'biweek',value:'1-1',error:undefined});
            Object.assign(except.trashes[1].schedules[2],{type:'week',value:'3',error:undefined});
            except.error=false;

            let teststate = _.cloneDeep(multiInitialState);
            Object.assign(teststate.trashes[0].schedules[1],{type:'biweek',value:'0-1'});
            Object.assign(teststate.trashes[1].schedules[2],{type:'week',value:'3'});

            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:'1-1'});
            assert.deepEqual(except,state);
        });
        it('required error',()=>{
            let except = 'missingvalue';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules[1].type = 'month';
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:''});
            assert.equal(except,state.trashes[0].schedules[1].error);
            assert.equal(true,state.error);
        });
        it('number error',()=>{
            let except = 'wrongnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules[1].type = 'month';
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:'a'});
            assert.equal(except,state.trashes[0].schedules[1].error);
            assert.equal(true,state.error);
        });
        it('min error',()=>{
            let expect = 'wrongminnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules[1].type = 'month';
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:'0'});
            assert.equal(expect,state.trashes[0].schedules[1].error);
            assert.equal(true,state.error);
        });
        it('max error',()=>{
            let expect = 'wrongmaxnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules[1].type = 'month';
            let state = updateState(teststate,{type:ActionType.CHANGE_INPUT,index:[0,1],value:'32'});
            assert.equal(expect,state.trashes[0].schedules[1].error);
            assert.equal(true,state.error);
        });
    });
    describe('input other trash type',()=>{
        it('right input kanji,hiragana',()=>{
            const input_value = '資源ごみ';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input alphabet,number',()=>{
            const input_value = '0099AA';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input kana',()=>{
            const input_value = 'スチロール';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input whitespace',()=>{
            const input_value = 'My Trash';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('requirement error',()=>{
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: '',input_trash_type_error: 'missingvalue'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0,value: '',maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('elegular error script',()=>{
            const input_value = '<script/>';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('elegular error SQL injection',()=>{
            const input_value = 'or x=\'x\';';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            assert.deepEqual(state.trashes[0],expect.trashes[0]);
        });
        it('max length',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index:0,value:'これは１０文字の入力',maxlength:10});
            assert.equal(state.trashes[0].input_trash_type_error,undefined);
        });
        it('max lengthの最大値変更',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index:0,value:'１２文字の入力でも大丈夫',maxlength:20});
            assert.equal(state.trashes[0].input_trash_type_error,undefined);
        });
        it('length over',()=>{
            let expect = 'wronglengthstring';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = updateState(teststate,{type:ActionType.INPUT_TRASH_TYPE,index:0,value:'これは１１文字の入力だ',maxlength:10});
            assert.equal(state.trashes[0].input_trash_type_error,expect);
        });
    });
    describe('delete trash',()=>{
        it('multi to single',()=>{
            let state = updateState(multiInitialState,{type:ActionType.DEL_TRASH,index:0});
            assert.deepEqual(initialState,state);
        });
        it('single to zero',()=>{
            let state = updateState(initialState,{type:ActionType.DEL_TRASH,index:0});
            assert.equal(0,state.trashes.length);
        });
        it('multi delete',()=>{
            let teststate = _.cloneDeep(multiInitialState);
            teststate.trashes[0].type='paper';
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='paper';
            let state = updateState(teststate,{type:ActionType.DEL_TRASH,index:1});
            assert.deepEqual(except,state);
        });
    });
    describe('set preset', ()=>{
        it('has preset', ()=>{
            const preset = [
                {type:'burn',schedules:[{type:'weekday',value:'0'}]}];
            const initial_schedule = {
                type: 'none',
                value: '',
                error: undefined
            };
            let state = updateState(initialState, {type:ActionType.SET_USER_INFO, preset: preset});
            assert.equal(state.trashes[0].schedules.length,3);
            assert.equal(state.trashes[0].type,'burn');
            assert.equal(state.trashes[0].schedules[0].type,'weekday');
            assert.equal(state.trashes[0].schedules[0].value,'0');
            assert.equal(state.error,false);
            assert.deepEqual(state.trashes[0].schedules[0],preset[0].schedules[0]);
            assert.deepEqual(state.trashes[0].schedules[1],initial_schedule);
        });
    });
});

describe('SubmitState',()=> {
    describe('submitting',()=>{
        it('submit true',()=>{
            const state = SubmitState(undefined,{type:ActionType.SET_SUBMITTING,value:true});
            assert.equal(true,state.submitting);
        });
        it('submit false',()=>{
            const state = SubmitState({submitting:true},{type:ActionType.SET_SUBMITTING,value:false});
            assert.equal(false,state.submitting);
        });
        it('open error Dialog', ()=>{
            const state = SubmitState(undefined, {type:ActionType.ERROR_DIALOG, open: true});
            assert.equal(state.showErrorDialog, true);
        });
        it('close error Dialog', ()=>{
            const state = SubmitState({showErrorDialog:true}, {type:ActionType.ERROR_DIALOG, open: false});
            assert.equal(state.showErrorDialog, false);
        });
    });
});