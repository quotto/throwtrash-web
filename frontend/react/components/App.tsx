import React from 'react';
import {Grid} from '@mui/material';
import MainContainer from '../containers/MainContainer';
import TopAppBarContainer from '../containers/AppBarContainer';
import ExcludeDate from './excludeDate/ExcludeDate';
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
        );
    }
}
export default App;
