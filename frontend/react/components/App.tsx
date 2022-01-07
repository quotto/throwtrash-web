import React from 'react';
import { createTheme, Grid } from '@mui/material';
import MainContainer from '../containers/MainContainer';
import TopAppBarContainer from '../containers/AppBarContainer';
import ExcludeDate from './excludeDate/ExcludeDate';
import { BrowserRouter as Router,Route,Switch } from 'react-router-dom';
import { ThemeProvider } from '@mui/styles';

const defaultTheme = createTheme({
});
class App extends React.Component<{},{}> {
    render() {
        return (
            <ThemeProvider theme={defaultTheme}>
                <Grid container>
                    <TopAppBarContainer />
                    <Grid container justifyContent='center' item xs={12}>
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
            </ThemeProvider>
        );
    }
}
export default App;
