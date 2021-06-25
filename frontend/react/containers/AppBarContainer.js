import {connect} from 'react-redux';
import TopAppBar from '../components/TopAppBar';
import {
    setUserInfo,
    signOut,
    signinDialog,
    changeMenu,
    notificationDialog
} from '../actions';

const mapPropsState = (state)=> {
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

const AppBarContainer = connect(
    mapPropsState,
    {
        onSetUserInfo: setUserInfo,
        onSignOut: signOut,
        onSigninDialog: signinDialog,
        onChangeMenu: changeMenu,
        onNotificationDialog: notificationDialog,
    }
)(TopAppBar);

export default AppBarContainer;