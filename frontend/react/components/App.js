import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import MainContainer from '../containers/MainContainer';
import TopAppBarContainer from '../containers/AppBarContainer';
import ExcludeDate from '../components/excludeDate/ExcludeDate';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';

const defaultTheme = createMuiTheme({
    typography: {
        useNextVariants: true
    }
});
class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider theme={defaultTheme}>
                <Grid container>
                    <TopAppBarContainer />
                    <Grid container justify='center' item xs={12}>
                        <Router>
                            <Switch>
                                <Route exact={true} path="/frontend/dist/dev">
                                    <MainContainer />
                                </Route>
                                <Route path="/exclude/:trashIndex">
                                    <ExcludeDate />
                                </Route>
                            </Switch>
                        </Router>
                    </Grid>
                </Grid>
            </MuiThemeProvider>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object,
    t: PropTypes.func
};
export default withTranslation()(App);
