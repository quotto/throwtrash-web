import {initialState, Trash} from '../react/reducers/TrashReducer';
import TestReducer from '../react/reducers/TrashReducer';
import SubmitReducer from '../react/reducers/SubmitReducer';
import {ACTION_TYPE} from '../react/actions/index';
import _ from 'lodash';

let multiInitialState = _.cloneDeep(initialState);
multiInitialState.trashes.push(_.cloneDeep(initialState.trashes[0]));


describe('updateState',()=>{
    it('Add Trash Type',()=>{
        const state = TestReducer(undefined,{type:ACTION_TYPE.ADD_TRASH});
        expect(multiInitialState).toStrictEqual(state);
    });
    describe('change trash',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='bin';
            const state = TestReducer(undefined,{type:ACTION_TYPE.CHANGE_TRASH,value:'bin',index:0,validate:[]});
            expect(state).toStrictEqual(except);
        });
        it('multi trash',()=>{
            let except = _.cloneDeep(multiInitialState);
            except.trashes[1].type='bin';
            const state = TestReducer(multiInitialState,{type:ACTION_TYPE.CHANGE_TRASH,value:'bin',index:1,validate:[]});
            expect(state).toStrictEqual(except);
        });
    });
    describe('change schedule',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            except.trashes[0].schedules.push({type: 'weekday', value: '0'});
            Object.assign(except.trashes[0].schedules[1],{error: undefined, type: 'month',value:''});
            except.error = true; //monthの場合は入力必須のため初期状態はエラー
            const state = TestReducer(undefined,{type:ACTION_TYPE.CHANGE_SCHEDULE,index:[0,1],value:'month'});
                expect(state).toStrictEqual(except);
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
            expect(state).toStrictEqual(except);
        });
    });
    describe('change input',()=>{
        it('single trash',()=>{
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0].schedules[0],{type:'month',value:'13',error:undefined});

            let teststate = _.cloneDeep(initialState);
            Object.assign(teststate.trashes[0].schedules[0],{type:'month'});

            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,0],value:'13'});
            expect(state).toStrictEqual(except);
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
            expect(state).toStrictEqual(except);
        });
        it('required error',()=>{
            let except = 'missingvalue';
            let teststate = _.cloneDeep(initialState);

            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:''});
            expect(state.trashes[0].schedules[1].error).toBe(except);
            expect(state.error).toBeTruthy();
        });
        it('number error',()=>{
            let except = 'wrongnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'a'});
            expect(state.trashes[0].schedules[1].error).toBe(except);
            expect(state.error).toBeTruthy();
        });
        it('min error',()=>{
            let except = 'wrongminnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'0'});
            expect(state.trashes[0].schedules[1].error).toBe(except);
            expect(state.error).toBeTruthy();
        });
        it('max error',()=>{
            let except = 'wrongmaxnumber';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].schedules.push({type: 'weekday', value: '0'});
            teststate.trashes[0].schedules[1].type = 'month';
            let state = TestReducer(teststate,{type:ACTION_TYPE.CHANGE_INPUT,index:[0,1],value:'32'});
            expect(state.trashes[0].schedules[1].error).toBe(except);
            expect(state.error).toBeTruthy();
        });
    });
    describe('input other trash type',()=>{
        it('right input kanji,hiragana',()=>{
            const input_value = '資源ごみ';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('right input alphabet,number',()=>{
            const input_value = '0099AA';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('right input kana',()=>{
            const input_value = 'スチロール';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('right input whitespace',()=>{
            const input_value = 'My Trash';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('requirement error',()=>{
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: '',input_trash_type_error: 'missingvalue'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0,value: '',maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('elegular error script',()=>{
            const input_value = '<script/>';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('elegular error SQL injection',()=>{
            const input_value = 'or x=\'x\';';
            let except = _.cloneDeep(initialState);
            Object.assign(except.trashes[0],{type: 'other',trash_val: input_value,input_trash_type_error: 'wrongcharacter'});

            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index: 0, value: input_value,maxlength:10});
            expect(state.trashes[0]).toStrictEqual(except.trashes[0]);
        });
        it('max length',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'これは１０文字の入力',maxlength:10});
            expect(state.trashes[0].input_trash_type_error).toBeUndefined();
        });
        it('max lengthの最大値変更',()=>{
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'１２文字の入力でも大丈夫',maxlength:20});
            expect(state.trashes[0].input_trash_type_error).toBeUndefined();
        });
        it('length over',()=>{
            let except = 'wronglengthstring';
            let teststate = _.cloneDeep(initialState);
            teststate.trashes[0].type = 'other';
            let state = TestReducer(teststate,{type:ACTION_TYPE.INPUT_TRASH_TYPE,index:0,value:'これは１１文字の入力だ',maxlength:10});
            expect(state.trashes[0].input_trash_type_error).toBe(except);
        });
    });
    describe('delete trash',()=>{
        it('multi to single',()=>{
            let state = TestReducer(multiInitialState,{type:ACTION_TYPE.DEL_TRASH,index:0});
            expect(state).toStrictEqual(initialState);
        });
        it('single to zero',()=>{
            let state = TestReducer(initialState,{type:ACTION_TYPE.DEL_TRASH,index:0});
            expect(state.trashes.length).toBe(0);
        });
        it('multi delete',()=>{
            let teststate = _.cloneDeep(multiInitialState);
            teststate.trashes[0].type='paper';
            let except = _.cloneDeep(initialState);
            except.trashes[0].type='paper';
            let state = TestReducer(teststate,{type:ACTION_TYPE.DEL_TRASH,index:1});
            expect(state).toStrictEqual(except);
        });
    });
    describe('set preset', ()=>{
        it('has preset', ()=>{
            const preset: Trash[] = [
                {type:'burn',trash_val: '',schedules:[{type:'weekday',value:'3'}], excludes:[{month: 12, date: 1}],is_excludes_error: false, is_excludes_submitted: false}];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            expect(state.trashes[0].schedules.length).toBe(1);
            expect(state.trashes[0].type).toBe('burn');
            expect(state.trashes[0].schedules[0].type).toBe('weekday');
            expect(state.trashes[0].schedules[0].value).toBe('3');
            expect(state.trashes[0].excludes[0].month).toBe(12);
            expect(state.trashes[0].excludes[0].date).toBe(1);
            expect(state.error).toBeFalsy();
            expect(state.trashes[0].schedules[0]).toStrictEqual(preset[0].schedules[0]);
        });
        it('no preset', ()=>{
            const preset: Trash[] = [];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            expect(state.trashes.length).toBe(initialState.trashes.length);
        });
        it('excludesが無いプリセットは空配列で補完される', ()=>{
            const preset: Trash[] = [
                {type:'burn',trash_val: '',schedules:[{type:'weekday',value:'3'}],excludes:[],is_excludes_error: false, is_excludes_submitted: false}];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            expect(state.trashes[0].schedules.length).toBe(1);
            expect(state.trashes[0].type).toBe('burn');
            expect(state.trashes[0].schedules[0].type).toBe('weekday');
            expect(state.trashes[0].schedules[0].value).toBe('3');
            expect(state.error).toBeFalsy();
            expect(state.trashes[0].excludes.length).toBe(0);
            expect(state.trashes[0].schedules[0]).toStrictEqual(preset[0].schedules[0]);
        });
    });
    describe('set user info', ()=>{
        it('has preset', ()=>{
            // SET_PRESETと同じ結果になる
            const preset: Trash[] = [
                {type:'burn',trash_val: '',schedules:[{type:'weekday',value:'3'}], excludes:[{month: 12, date: 1}],is_excludes_error: false, is_excludes_submitted: false}];
            let state = TestReducer(initialState, {type:ACTION_TYPE.SET_USER_INFO, preset: preset, user_info: {name: 'test'}});
            expect(state.trashes[0].schedules.length).toBe(1);
            expect(state.trashes[0].type).toBe('burn');
            expect(state.trashes[0].schedules[0].type).toBe('weekday');
            expect(state.trashes[0].schedules[0].value).toBe('3');
            expect(state.trashes[0].excludes[0].month).toBe(12);
            expect(state.trashes[0].excludes[0].date).toBe(1);
            expect(state.error).toBeFalsy();
            expect(state.trashes[0].schedules[0]).toStrictEqual(preset[0].schedules[0]);
        });
    });
});

describe('SubmitState',()=> {
    describe('submitting',()=>{
        it('submit true',()=>{
            const state = SubmitReducer(undefined,{type:ACTION_TYPE.SET_SUBMITTING,value:true});
            expect(state.submitting).toBeTruthy();
        });
        it('submit false',()=>{
            const state = SubmitReducer({submitting:true},{type:ACTION_TYPE.SET_SUBMITTING,value:false});
            expect(state.submitting).toBeFalsy();
        });
        it('open error Dialog', ()=>{
            const state = SubmitReducer(undefined, {type:ACTION_TYPE.ERROR_DIALOG, openDialog: true});
            expect(state.showErrorDialog).toBeTruthy();
        });
        it('close error Dialog', ()=>{
            const state = SubmitReducer({submitting: false, showErrorDialog:true}, {type:ACTION_TYPE.ERROR_DIALOG, openDialog: false});
            expect(state.showErrorDialog).toBeFalsy();
        });
    });
});