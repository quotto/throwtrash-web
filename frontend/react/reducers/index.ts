import {combineReducers} from 'redux';
import ExcludeDateReducer, { ExcludeDateReducerState } from './ExcludeDateReducer';
import TrashReducer, { TrashReducerState } from './TrashReducer';
import SubmitReducer, { SubmitReducerState } from './SubmitReducer';
import MenuReducer, { MenuReducerState } from './MenuReducer';
import LoginReducer, { LoginReducerState } from './LoginReducer';
import UserReducer, { UserReducerState } from './UserReducer';
import ZipCodeReducer, { ZipcodeReducerState } from './ZipcodeReducer';
import NextdayCheckReducer, { NextdayCheckReducerState } from './NextdayCheckReducer';

// combineするプロパティ名はいずれ修正したい
// (既にComponentで利用されている名前もあるのでこのままとしている)
// const TrashScheduleApp = combineReducers<TrashReducerState|SubmitReducerState|LoginReducerState|MenuReducerState|UserReducerState|ExcludeDateReducerState|ZipcodeReducerState|NextdayCheckReducerState>({
const TrashScheduleApp = {
    updateState: TrashReducer,
    SubmitState: SubmitReducer,
    LoginState: LoginReducer,
    MenuState: MenuReducer,
    UserState: UserReducer,
    excludeReducer: ExcludeDateReducer,
    zipCodeReducer: ZipCodeReducer,
    nextdayCheckReducer: NextdayCheckReducer
};

export default TrashScheduleApp;