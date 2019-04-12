import React from 'react';
import {Grid} from '@material-ui/core';
import SubmitForm from './Form';
import {AppStyle} from './style.js';
import {withStyles} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';

class App extends React.Component {

    render() {
        return (
            <div className={this.props.classes.component}>
                <Grid container spacing={24}>
                    <Grid item xs={12} style={{textAlign:'center'}}><h3>{this.props.t('translation:App.title')}</h3></Grid>
                    <Grid item xs={12} style={{textAlign:'center'}}>
                        <ul style={{display:'inline-block',textAlign:'left'}}>
                            <li>{this.props.t('App.description.trash')}</li>
                            <li>{this.props.t('App.description.schedule')}</li>
                        </ul>
                    </Grid>
                </Grid>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        <SubmitForm />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(AppStyle)(withTranslation()(App));
