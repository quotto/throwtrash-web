import React from 'react'
import { DialogTitle, withStyles, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import axios from 'axios';

const styles = (theme)=>({
    signinRoot:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    signinDescription: {
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%'
        }
    },
    signInButton: {
        cursor: 'pointer',
        marginBottom: '10px'
    },
    googleButtonImg: {
        width: '160px',
        height: '38px'
    },
    loginButton: {
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%'
        },
        border: 'solid'
    },
    root: {
        position: 'absolute',
        right: '20px'
    }
});

class SignInDialog extends React.Component {
    constructor(props) {
        super(props);
        console.log('constructor');
        axios.get('/user_info')
            .then(response => {
                console.log(response);
                if (response.status === 200) {
                    props.onSetUserInfo(response.data);
                }
            }).catch(err => {
                console.log(err);
            });
    }

    componentDidMount() {
        console.log('did mount');
        if(document.getElementById('amazon-root')) {
            console.log('initialize amazon login');
            window.onAmazonLoginReady = function () {
                // eslint-disable-next-line no-undef
                amazon.Login.setClientId('amzn1.application-oa2-client.8b1fd843af554c6891d9e48fc3c75be7');
            };
            (function (d) {
                var a = d.createElement('script'); a.type = 'text/javascript';
                a.async = true; a.id = 'amazon-login-sdk';
                a.src = 'https://assets.loginwithamazon.com/sdk/na/login1.js';
                d.getElementById('amazon-root').appendChild(a);
            })(document);
        }
    }

    loginWithAmazon() {
        var options = { scope: 'profile' };
        // eslint-disable-next-line no-undef
        amazon.Login.authorize(options,
            'https://localhost.net/signin?service=amazon');
        return false;
    }

    render() {
        console.log('render');
        const {classes} = this.props;
        if(!this.props.signedIn) {
            return (
                <div className={classes.root}>
                    <div id="amazon-root"></div>
                    <Button 
                        className={classes.loginButton}
                        color="inherit" 
                        onClick={()=>{this.props.onSigninDialog(true);}}>
                            ログイン
                    </Button>
                    <Dialog 
                        onClose={()=>{this.props.onSigninDialog(false);}} 
                        open={this.props.signinDialog}
                        scroll='body'
                        aria-labelledby="signin-dialog-title">
                        <DialogTitle id="signin-dialog-title">ログイン</DialogTitle>
                        <DialogContent>
                            <DialogContentText className={classes.signinDescription}>
                                お持ちのAmazonまたはGoogleアカウントでログインすることで登録したスケジュールを簡単に修正することができます。
                            </DialogContentText>
                        </DialogContent>
                        <div className={classes.signinRoot}>
                            <a id='LoginWithAmazon' className={classes.signInButton} onClick={this.loginWithAmazon}>
                                <img src='https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_156x32.png' alt='sign in with Amazon' />
                            </a>
                            <a href='/oauth_signin' className={classes.signInButton}>
                                <img className={classes.googleButtonImg} src='https://d29p8bq9xwgr82.cloudfront.net/img/btn_google_signin_ja.png' alt='sign in with Google' />
                            </a>
                        </div>
                        <DialogActions>
                            <Button onClick={()=>this.props.onSigninDialog(false)}>
                                閉じる
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
}

export default withStyles(styles)(SignInDialog);