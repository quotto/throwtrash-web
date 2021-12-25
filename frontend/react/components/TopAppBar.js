import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SignInDialog from './SignInDialog';
import NotificationDialog from './NotificationDialog';
import BarMenu from './BarMenu';

const styles = (theme)=>({
    root: {
        flexGrow: 1,
    },
    appBarTitle: {
        flexGrow: 1,
        color: '#ffffff',
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%'
        }
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    }
});


class TopAppBar extends React.Component {
    render(){
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            data-title={this.props.t('IntroJS.other.title')}
                            data-intro={this.props.t('IntroJS.other.hint')}
                            data-step={4}
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            arial-control="menu"
                            onClick={(event)=>this.props.onChangeMenu(true,event.target)}>
                            <MenuIcon />
                        </IconButton>
                        <BarMenu {...this.props} />
                        <Typography variant="h6" className={classes.appBarTitle}>
                            {this.props.t('TopAppBar.title')}
                        </Typography>
                        <NotificationDialog
                            notificationDialog={this.props.notificationDialog}
                            onNotificationDialog={this.props.onNotificationDialog}
                        />
                        <SignInDialog
                            signinDialog={this.props.signinDialog}
                            onSigninDialog={this.props.onSigninDialog}
                            signedIn={this.props.signedIn}
                            onSetUserInfo={this.props.onSetUserInfo}
                        />
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

TopAppBar.propTypes = {
    classes: PropTypes.object,
    onChangeMenu: PropTypes.func,
    signinDialog: PropTypes.bool,
    onSigninDialog: PropTypes.func,
    signedIn: PropTypes.bool,
    onSetUserInfo: PropTypes.func,
    onNotificationDialog: PropTypes.func,
    notificationDialog: PropTypes.bool,
    t: PropTypes.func
};
export default withTranslation()(withStyles(styles)(TopAppBar));