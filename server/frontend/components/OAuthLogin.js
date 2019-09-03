import React from 'react';
import axios from 'axios';
import { Hidden, Button } from '@material-ui/core';

class OAuthLogin extends React.Component {
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

    signOut(props) {
        console.log('signout');
        axios.get('/signout')
            .then(response=>{
                console.log(response);
                props.onSignOut();
            }).catch(err=>{
                console.log(err);
            });
    }

    componentDidMount() {
        console.log('did mount');
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
            document.getElementById('LoginWithAmazon').onclick = function () {
                var options = { scope: 'profile' };
                // eslint-disable-next-line no-undef
                amazon.Login.authorize(options,
                    'https://localhost.net/signin?service=amazon');
                return false;
            };
        }
    }

    render(){
        console.log('render');
        if(this.props.signedIn) {
            console.log('signing');
            return (
                <Button onClick={()=>this.signOut(this.props)}>ログアウト</Button>
            );
        }
        return (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <div id="amazon-root"></div>
                <a id='LoginWithAmazon' style={{ cursor: 'pointer' }}>
                    <img src='https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_156x32.png' alt='sign in with Amazon' />
                </a>
                <a href='/oauth_signin'>
                    <img src='https://d29p8bq9xwgr82.cloudfront.net/img/btn_google_signin_ja.png' alt='sign in with Google' />
                </a>
            </div>
        );
    }
}

export default OAuthLogin;