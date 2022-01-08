import React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {DialogTitle,Dialog,DialogContent,DialogContentText,DialogActions,Button,Theme } from '@mui/material';
import introJs from 'intro.js';
import { WithStyles, StyleRules, createStyles, withStyles } from '@mui/styles';
import { AppBarProps } from '../containers/AppBarContainer';

const styles = (theme: Theme): StyleRules=> createStyles({
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

const isShowedNotification = ()=>{
    return document.cookie.indexOf('showedNotification=true') >= 0;
};

interface Props extends AppBarProps,WithStyles<typeof styles>,WithTranslation{}
class NotificationDialog extends React.Component<Props, {}> {
    runIntroJs() {
        const customIntroJs = introJs().setOptions({
            'nextLabel':'>',
            'prevLabel':'<',
            'doneLabel': this.props.t('IntroJS.label.done')
        });
        customIntroJs.start();
    }

    componentDidMount() {
        const ua = navigator.userAgent;
        if(!isShowedNotification())  {
            if(ua.indexOf('iPhone') === -1 && ua.indexOf('iPad') === -1) {
                //ダイアログの表示
                this.props.onNotificationDialog(true);
            } else {
                // iOSの場合はcomponentDidUpdateがコールされないためここでcookie更新、IntroJS実行
                document.cookie = 'showedNotification=true; ' + document.cookie;
                this.runIntroJs();
            }
        }
    }

    componentDidUpdate() {
        // iOS以外で通知ダイアログが閉じられた直後にIntroJSを開始する
        if(!this.props.notificationDialog && !isShowedNotification()) {
            document.cookie = 'showedNotification=true; ' + document.cookie;
            this.runIntroJs();
        }
    }

    render() {
        const {classes} = this.props;
        return(
            <Dialog
                onClose={()=>{
                    this.props.onNotificationDialog(false);
                }}
                open={typeof(this.props.notificationDialog)!='undefined' ? this.props.notificationDialog : false}
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
                            <img className={classes.googleplayImg} alt='Google Play で手に入れよう' src='https://play.google.com/intl/en_us/badges/static/images/badges/ja_badge_web_generic.png' />
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

export default withTranslation()(withStyles(styles)(NotificationDialog));