import React from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from './components/App';
import TrashScheduleApp from './reducers';
import {BrowserRouter} from 'react-router-dom';
import i18next from './lang/i18n.js';
import './index.css';

let store = createStore(TrashScheduleApp);


class LangProvider extends React.Component {
    render(){
        const lang = navigator.language || navigator.browserLanguage || navigator.userLanguage || 'ja-JP';
        console.log(lang);
        i18next.changeLanguage(lang.substr(0,2));
        return(
            <App />
        );
    }
}

LangProvider.propTypes = {
    match: PropTypes.object
};

let render_flg = false
if(navigator.cookieEnabled) {
    document.cookie = 'isEnabledCookie=true; '+document.cookie;
    if(document.cookie.length > 0) {
        render_flg = true;
    }
}
if(render_flg) {
    render(
        <Provider store={store}>
            <LangProvider />
        </Provider>,
        document.getElementById('root')
    );
} else {
    document.getElementById('root').innerText = 'ブラウザのCookieが無効になっています。Cookieを有効にしてからお試しください。';
}
