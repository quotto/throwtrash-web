import {initialState, Trash} from '../react/reducers/TrashReducer';
import TestReducer from '../react/reducers/TrashReducer';
import SubmitReducer from '../react/reducers/SubmitReducer';
import {ACTION_TYPE} from '../react/actions/index';
const assert = require('assert');
const _ = require('lodash');

let multiInitialState = _.cloneDeep(initialState);
multiInitialState.trashes.push(_.cloneDeep(initialState.trashes[0]));


describe('updateState',()=>{
    it('Add Trash Type',()=>{
        const state = TestReducer(undefined,{type:ACTION_TYPE.ADD_TRASH});
        assert.deepStrictEqual(multiInitialState,state);
    });
    describe('change trash',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='bin';
            const state = TestReducer(undefined,{type:ACTION_TYPE.CHANGE_TRASH,value:'bin',index:0,validate:[]});
            assert.deepStrictEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            except.trashes[1].type='bin';
            const state = TestReducer(multiInitialState,{type:ACTION_TYPE.CHANGE_TRASH,value:'bin',index:1,validate:[]});
            assert.deepStrictEqual(except,state);
        });
    });
    describe('change schedule',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            except.trashes[0].schedules.push({type: 'weekday', value: '0'});
            Object.assign(except.trashes[0].schedules[1],{error: undefined, type: 'month',value:''});
            except.error = true; //monthの場合は入力必須のため初期状態はエラー
            const state = TestReducer(undefined,{type:ACTION_TYPE.CHANGE_SCHEDULE,index:[0,1],value:'month'});
            assert.deepStrictEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            except.trashes[0].schedules.push({error: undefined ,type: 'weekday', value: '0'});
            except.trashes[0].schedules.push({error: undefined, type: 'weekday', value: '0'});
            except.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            Object.assign(except.trashes[0].schedules[2],{error: undefined, type: 'biweek',value:'0-1'});
            Object.assign(except.trashes[1].schedules[1],{error: undefined, type: 'weekday',value:'0'});
            except.error = false; //month以外は初期値が設定されるのでエラー無し

            let teststate = _.cloneDeep(multiInitialState);
            teststate.trashes[0].schedules.push({error: undefined, type: 'weekday', value: '0'});
            teststate.trashes[0].schedules.push({error: undefined, type: 'weekday', value: '0'});
            teststate.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_SCHEDULE,index:[0,2],value:'biweek'});
            state = TestReducer(state,{type:ACTION_TYPE.CHANGE_SCHEDULE,index:[1,1],value:'weekday'});
            assert.deepStrictEqual(except,state);
        });
    });
    describe('change input',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0].schedules[0],{type:'month',value:'13',error:undefined});

            let teststate = _.cloneDeep(initialState);
            Object.assign(teststate.trashes[0].schedules[0],{type:'month'});

            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,0],value:'13'});
            assert.deepStrictEqual(except,state);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            except.trashes[0].schedules.push({error: undefined, type: 'weekday', value: '0'});
            except.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            except.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            Object.assign(except.trashes[0].schedules[1],{type:'biweek',value:'1-1',error:undefined});
            Object.assign(except.trashes[1].schedules[2],{type:'week',value:'3',error:undefined});
            except.error=false;

            let teststate = _.cloneDeep(multiInitialState);
            teststate.trashes[0].schedules.push({error: undefined, type: 'weekday', value: '0'});
            teststate.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            teststate.trashes[1].schedules.push({error: undefined, type: 'weekday', value: '0'});
            Object.assign(teststate.trashes[0].schedules[1],{type:'biweek',value:'0-1',error: undefined});
            Object.assign(teststate.trashes[1].schedules[2],{type:'week',value:'3',error: undefined});

            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'1-1'});
            assert.deepStrictEqual(except,state);
        });
        it('required error',()=>{
            let except = 'missingvalue';
            let teststate = _.cloneDeep(initialState);

            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:''});
            assert.strictEqual(except,state.trashes[0].schedules[1].error);
            assert.strictEqual(true,state.error);
        });
        it('number error',()=>{
            let except = 'wrongnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'a'});
            assert.strictEqual(except,state.trashes[0].schedules[1].error);
            assert.strictEqual(true,state.error);
        });
        it('min error',()=>{
            let expect = 'wrongminnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'0'});
            assert.strictEqual(expect,state.trashes[0].schedules[1].error);
            assert.strictEqual(true,state.error);
        });
        it('max error',()=>{
            let expect = 'wrongmaxnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'32'});
            assert.strictEqual(expect,state.trashes[0].schedules[1].error);
            assert.strictEqual(true,state.error);
        });
    });
    describe('input other trash type',()=>{
        it('right input kanji,hiragana',()=>{
            const input_value = '資源ごみ';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input alphabet,number',()=>{
            const input_value = '0099AA';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input kana',()=>{
            const input_value = 'スチロール';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('right input whitespace',()=>{
            const input_value = 'My Trash';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('requirement error',()=>{
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: '',input_trash_type_error: 'missingvalue'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: '',maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('elegular error script',()=>{
            const input_value = '<script/>';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('elegular error SQL injection',()=>{
            const input_value = 'or x=\'x\';';
            let expect = _.cloneDeep(initialState);
            Object.assign(expect.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            assert.deepStrictEqual(state.trashes[0],expect.trashes[0]);
        });
        it('max length',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'これは１０文字の入力',maxlength:10});
            assert.strictEqual(state.trashes[0].input_trash_type_error,undefined);
        });
        it('max lengthの最大値変更',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'１２文字の入力でも大丈夫',maxlength:20});
            assert.strictEqual(state.trashes[0].input_trash_type_error,undefined);
        });
        it('length over',()=>{
            let expect = 'wronglengthstring';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'これは１１文字の入力だ',maxlength:10});
            assert.strictEqual(state.trashes[0].input_trash_type_error,expect);
        });
    });
    describe('delete trash',()=>{
        it('multi to single',()=>{
            let state = TestReducer(multiInitialState,{type:ACTION_TYPE.DEL_TRASH,index:0});
            assert.deepStrictEqual(initialState,state);
        });
        it('single to zero',()=>{
            let state = TestReducer(initialState,{type:ACTION_TYPE.DEL_TRASH,index:0});
            assert.strictEqual(0,state.trashes.length);
        });
        it('multi delete',()=>{
            let teststate = _.cloneDeep(multiInitialState);
            teststate.trashes[0].type='paper';
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='paper';
            let state = TestReducer(teststate,{type:ACTION_TYPE.DEL_TRASH,index:1});
            assert.deepStrictEqual(except,state);
        });
    });
    describe('set preset', ()=>{
        it('has preset', ()=>{
            const preset: Trash[] = [
                {type:'burn',trash_val: '',schedules:[{type:'weekday',value:'3'}], excludes:[{month: 12, date: 1}],is_excludes_error: false, is_excludes_submitted: false}];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            assert.strictEqual(state.trashes[0].schedules.length,1);
            assert.strictEqual(state.trashes[0].type,'burn');
            assert.strictEqual(state.trashes[0].schedules[0].type,'weekday');
            assert.strictEqual(state.trashes[0].schedules[0].value,'3');
            assert.strictEqual(state.trashes[0].excludes[0].month,12);
            assert.strictEqual(state.trashes[0].excludes[0].date,1);
            assert.strictEqual(state.error,false);
            assert.deepStrictEqual(state.trashes[0].schedules[0],preset[0].schedules[0]);
        });
        it('excludesが無いプリセットは空配列で補完される', ()=>{
            const preset: Trash[] = [
                {type:'burn',trash_val: '',schedules:[{type:'weekday',value:'3'}],excludes:[],is_excludes_error: false, is_excludes_submitted: false}];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            assert.strictEqual(state.trashes[0].schedules.length,1);
            assert.strictEqual(state.trashes[0].type,'burn');
            assert.strictEqual(state.trashes[0].schedules[0].type,'weekday');
            assert.strictEqual(state.trashes[0].schedules[0].value,'3');
            assert.strictEqual(state.error,false);
            assert.strictEqual(state.trashes[0].excludes.length, 0);
            assert.deepStrictEqual(state.trashes[0].schedules[0],preset[0].schedules[0]);
        });
    });
});

describe('SubmitState',()=> {
    describe('submitting',()=>{
        it('submit true',()=>{
            const state = SubmitReducer(undefined,{type:ACTION_TYPE.SET_SUBMITTING,value:true});
            assert.strictEqual(true,state.submitting);
        });
        it('submit false',()=>{
            const state = SubmitReducer({submitting:true},{type:ACTION_TYPE.SET_SUBMITTING,value:false});
            assert.strictEqual(false,state.submitting);
        });
        it('open error Dialog', ()=>{
            const state = SubmitReducer(undefined, {type:ACTION_TYPE.ERROR_DIALOG, openDialog: true});
            assert.strictEqual(state.showErrorDialog, true);
        });
        it('close error Dialog', ()=>{
            const state = SubmitReducer({submitting: false, showErrorDialog:true}, {type:ACTION_TYPE.ERROR_DIALOG, openDialog: false});
            assert.strictEqual(state.showErrorDialog, false);
        });
    });
});