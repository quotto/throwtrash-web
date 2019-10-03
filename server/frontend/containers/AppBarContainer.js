import {connect} from 'react-redux';
import TopAppBar from '../components/TopAppBar';
import {
    setUserInfo,
    signOut,
    signinDialog,
    changeMenu
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
        openContact: state.MenuState.openContact
    };
};

const mapDispatchToProps = (dispatch)=>{
    return {
        onSetUserInfo: (user_info,preset)=>{
            dispatch(setUserInfo(user_info,preset));
        },
        onSignOut: ()=>{
            dispatch(signOut());
        },
        onSigninDialog: (value)=>{
            dispatch(signinDialog(value));
        },
        onChangeMenu: (value,target)=>{
            dispatch(changeMenu(value,target));
        }
    };
};

const AppBarContainer = connect(
    mapPropsState,
    mapDispatchToProps
)(TopAppBar);

export default AppBarContainer;