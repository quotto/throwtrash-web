import {connect, ConnectedProps} from 'react-redux';
import TopAppBar from '../components/TopAppBar';
import {
    setUserInfo,
    signOut,
    signinDialog,
    changeMenu,
    notificationDialog
} from '../actions';
import { LoginReducerState } from '../reducers/LoginReducer';
import { MenuReducerState } from '../reducers/MenuReducer';
import { UserReducerState } from '../reducers/UserReducer';

interface AppBarState {
    LoginState: LoginReducerState,
    MenuState: MenuReducerState,
    UserState: UserReducerState
}
const mapPropsState = (state: AppBarState)=> {
    return {
        signedIn: state.LoginState.signedIn,
        userInfo: state.LoginState.userInfo,
        signinDialog: state.LoginState.signinDialog,
        menu: {
            open: state.MenuState.menuOpen,
            anchorEl: state.MenuState.anchorEl
        },
        openContact: state.MenuState.openContact,
        notificationDialog: state.UserState.notificationDialog
    };
};

const connector = connect(
    mapPropsState,
    {
        onSetUserInfo: setUserInfo,
        onSignOut: signOut,
        onSigninDialog: signinDialog,
        onChangeMenu: changeMenu,
        onNotificationDialog: notificationDialog,
    }
);

export type AppBarProps = ConnectedProps<typeof connector>;

export default connector(TopAppBar);