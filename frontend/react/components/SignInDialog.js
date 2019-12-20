import React from 'react';
import PropTypes from 'prop-types';
import { DialogTitle, withStyles, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import axios from 'axios';
// import axiosCookiejarSupport from 'axios-cookiejar-support';
// import tough from 'tough-cookie';
// axiosCookiejarSupport(axios);
// import rp from 'request-promise';

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
        // rp('https://backend.mythrowaway.net/test/user_info',{
        //     jar:true,
        //     json: true
        // }).then((response)=>{
        //     if(response.statuc === 200 && response.body.preset) {
        //         props.onSetUserInfo(
        //             { name: response.data.name },
        //             response.data.preset
        //         );
        //     }
        // });
        // const cookiejar = new tough.CookieJar();
        axios.get('https://backend.mythrowaway.net/test/user_info',{
            // jar: cookiejar,
            withCredentials: true
        }).then(response => {
            if (response.status === 200 && response.data.preset) {
                props.onSetUserInfo(
                    { name: response.data.name },
                    response.data.preset
                );
            }
        });
    }

    componentDidMount() {
        if(document.getElementById('amazon-root')) {
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
        // amazon.Login.authorize({scope: 'profile'},
        //     'https://backend.mythrowaway.net/test/signin?service=amazon');
        // eslint-disable-next-line no-undef
        amazon.Login.authorize(options, (response)=>{
            if(response.error) {
                console.error('amazonログインエラー:' + response.error);
                return;
            }
            document.location.href = `https://backend.mythrowaway.net/test/signin?service=amazon&access_token=${encodeURIComponent(response.access_token)}`;
        });
        return false;
    }

    render() {
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
                            <a href='https://backend.mythrowaway.net/test/google_signin' className={classes.signInButton}>
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

SignInDialog.propTypes = {
    signinDialog: PropTypes.bool,
    classes: PropTypes.object,
    onSigninDialog: PropTypes.func,
    signedIn: PropTypes.bool,
    onSetUserInfo: PropTypes.func
};

export default withStyles(styles)(SignInDialog);