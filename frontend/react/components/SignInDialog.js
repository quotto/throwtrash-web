import React from 'react';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
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
        axios.get(`https://backend.mythrowaway.net/${API_STAGE}/user_info`,{
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
        amazon.Login.authorize(options, (response)=>{
            if(response.error) {
                console.error('amazonログインエラー:' + response.error);
                return;
            }
            document.location.href = `https://backend.mythrowaway.net/${API_STAGE}/signin?service=amazon&access_token=${encodeURIComponent(response.access_token)}`;
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
                            {this.props.t('SigninDialog.login')}
                    </Button>
                    <Dialog 
                        onClose={()=>{this.props.onSigninDialog(false);}} 
                        open={this.props.signinDialog}
                        scroll='body'
                        aria-labelledby="signin-dialog-title">
                        <DialogTitle id="signin-dialog-title">{this.props.t('SigninDialog.login')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText className={classes.signinDescription}>
                                {this.props.t('SigninDialog.aboutlogin')}
                            </DialogContentText>
                        </DialogContent>
                        <div className={classes.signinRoot}>
                            <a id='LoginWithAmazon' className={classes.signInButton} onClick={this.loginWithAmazon}>
                                <img src='https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_156x32.png' alt='sign in with Amazon' />
                            </a>
                            <a href={`https://backend.mythrowaway.net/${API_STAGE}/google_signin`} className={classes.signInButton}>
                                <img className={classes.googleButtonImg} src='/img/btn_google_signin_ja.png' alt='sign in with Google' />
                            </a>
                        </div>
                        <DialogActions>
                            <Button onClick={()=>this.props.onSigninDialog(false)}>
                                {this.props.t('SigninDialog.close')}
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
    onSetUserInfo: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(withStyles(styles)(SignInDialog));