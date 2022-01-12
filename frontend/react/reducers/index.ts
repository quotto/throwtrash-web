import ExcludeDateReducer from './ExcludeDateReducer';
import TrashReducer from './TrashReducer';
import SubmitReducer from './SubmitReducer';
import MenuReducer from './MenuReducer';
import LoginReducer from './LoginReducer';
import UserReducer from './UserReducer';
import ZipCodeReducer from './ZipcodeReducer';
import NextdayCheckReducer from './NextdayCheckReducer';

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