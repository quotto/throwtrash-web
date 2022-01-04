import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import MainContainer from '../containers/MainContainer';
import TopAppBarContainer from '../containers/AppBarContainer';
import ExcludeDate from './excludeDate/ExcludeDate';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';

// const defaultTheme = createMuiTheme({
//     typography: {
//         useNextVariants: true
//     }
// });
type Props = {
    classes: object,
    t: object
}
class App extends React.Component<{},{}> {
    render() {
        return (
            <Grid container>
                <TopAppBarContainer />
                <Grid container justify='center' item xs={12}>
                    <Router>
                        <Switch>
                            <Route path="/exclude/:trashIndex">
                                <ExcludeDate />
                            </Route>
                            <Route path="/">
                                <MainContainer />
                            </Route>
                        </Switch>
                    </Router>
                </Grid>
            </Grid>
        );
    }
}
export default App;
