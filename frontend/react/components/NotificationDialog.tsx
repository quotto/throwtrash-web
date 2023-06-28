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
    storeButtonImage: {
        width: '50%',
    },
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
            this.props.onNotificationDialog(true);
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
                            <img className={classes.storeButtonImage} alt='Google Play で手に入れよう' src='img/btn_google_play_ja.png' />
                        </a>
                    </div>
                    <div className={classes.notificationMainContent}>
                        <a href='https://apps.apple.com/jp/app/%E4%BB%8A%E6%97%A5%E3%81%AE%E3%82%B4%E3%83%9F%E5%87%BA%E3%81%97-%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88%E3%82%B9%E3%83%94%E3%83%BC%E3%82%AB%E3%83%BC%E9%80%A3%E6%90%BA/id6450391257'>
                            <img className={classes.storeButtonImage} alt='App Store で手に入れよう' src='img/btn_app_store_ja.svg' />
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