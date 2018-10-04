import React from 'react';
import {Grid} from '@material-ui/core';
import SubmitForm from './Form';
import {AppStyle} from './style.js';
import { withStyles } from '@material-ui/core/styles';

class App extends React.Component {

    render() {
        return (
            <div className={this.props.classes.component}>
                <Grid container spacing={24}>
                    <Grid item xs={12} style={{textAlign:'center'}}><h3>ゴミ出し with Alexa</h3></Grid>
                    <Grid item xs={12} style={{textAlign:'center'}}>
                        <ul style={{display:'inline-block',textAlign:'left'}}>
                            <li>最大10種類のゴミ出し予定を登録できます。</li>
                            <li>1種類のゴミに3つまでスケジュールを登録することができます。</li>
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

export default withStyles(AppStyle)(App);
