import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from './components/App';
import TrashScheduleApp from './reducers';
import {BrowserRouter,Route} from 'react-router-dom';
import i18next from './lang/i18n.js';

let store = createStore(TrashScheduleApp);


class LangProvider extends React.Component {
    render(){
        const lang = this.props.match.params.lang;
        i18next.changeLanguage(lang);
        return(
            <App />
        );
    }
}

render(
    <Provider store={store}>
        <BrowserRouter>
            <Route path='/index/:lang' component={LangProvider} />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
