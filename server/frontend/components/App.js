import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import ScheduleListContainer from '../containers/ScheduleListContainer';
import TopAppBarContainer from '../containers/AppBarContainer';
import {withStyles} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';

const styles = {
    TopMessage: {
        textAlign:'center',
        paddingBottom: '12px'
    }
};
class App extends React.Component {
    render() {
        return (
            <Grid container>
                <TopAppBarContainer/>
                <Grid item xs={12} className={this.props.classes.TopMessage}>
                    <ul style={{display:'inline-block',textAlign:'left'}}>
                        <li>{this.props.t('App.description.trash')}</li>
                        <li>{this.props.t('App.description.schedule')}</li>
                    </ul>
                </Grid>
                <Grid container justify='center' item xs={12}>
                    <ScheduleListContainer />
                </Grid>
            </Grid>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object,
    t: PropTypes.func
};
export default withStyles(styles)(withTranslation()(App));
