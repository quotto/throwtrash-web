import React from 'react';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {DialogTitle,Dialog,DialogContent,DialogContentText,DialogActions,Button,withStyles} from '@material-ui/core';

const styles = (theme)=> ({
    notificationMessage: {
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%'
        }
    },
    notificationMainContent: {
        textAlign: 'center',
        width: '100%'
    },
    googleplayImg: {
        width: '50%'
    }
});

class NotificationDialog extends React.Component {
    componentDidMount() {
        const ua = navigator.userAgent;
        console.log('UserAgent(NotificationDIalog):'+ ua);
        console.log('cookie(NotificationDialog):' + document.cookie);
        if(ua.indexOf('iPhone') === -1 && ua.indexOf('iPad') === -1 && document.cookie.indexOf('showedNotification=true') === -1)  {
            console.log('notification');
            //ダイアログの表示
            document.cookie = 'showedNotification=true; ' + document.cookie;
            this.props.onNotificationDialog(true);
        } else {
            console.log('not notification');
        }
    }

    render() {
        const {classes} = this.props;
        console.log(`notification: ${this.props.notificationDialog}`);
        return(
            <Dialog
                onClose={()=>{this.props.onNotificationDialog(false);}}
                open={this.props.notificationDialog}
                arial-labelledby="notification-dialog-title">
                <DialogTitle id="notification-dialog-title">
                    {this.props.t('NotificationDialog.title')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.notificationMessage}>
                        {this.props.t('NotificationDialog.message')}
                        <ul>
                            <li>{this.props.t('NotificationDialog.sub1')}</li>
                            <li>{this.props.t('NotificationDialog.sub2')}</li>
                            <li>{this.props.t('NotificationDialog.sub3')}</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogContent>
                    <div className={classes.notificationMainContent}>
                        <a href='https://play.google.com/store/apps/details?id=net.my.throwtrash&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
                            <img className={classes.googleplayImg} salt='Google Play で手に入れよう' src='https://play.google.com/intl/en_us/badges/static/images/badges/ja_badge_web_generic.png' />
                        </a>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.props.onNotificationDialog(false)}>
                        {this.props.t('NotificationDialog.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

NotificationDialog.propTypes= {
    notificationDialog: PropTypes.bool,
    classes: PropTypes.object,
    onNotificationDialog: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(withStyles(styles)(NotificationDialog));