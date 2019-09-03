import React from 'react';
import TrashSchedule from './TrashSchedule';
import {Button,Grid} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {AppStyle} from './style';
import axios from 'axios';
import {withTranslation} from 'react-i18next';
import OAuthLogin from './OAuthLogin';

const MAX_SCHEDULE = 10;
class ScheduleList extends React.Component {
    render() {
        if(this.props.submitting) {
            axios.post('/regist',JSON.stringify(this.props.trashes),{headers:{'Content-Type':'application/json'}})
                .then((response)=> {
                    window.location=response.data;
                }).catch((error) =>{
                    alert(this.props.t('ScheduleList.error.registrationfailed.text'),this.props.t('ScheduleList.error.registrationfailed.title'));
                    this.props.onSubmit(false);
                });
        }
        return (
            <Grid container spacing={24}>
                <TrashSchedule
                    trashes={this.props.trashes}
                    onChangeSchedule={this.props.onChangeSchedule}
                    onChangeTrash={this.props.onChangeTrash}
                    onChangeInput={this.props.onChangeInput}
                    onClick={this.props.onClickDelete}
                    onInputTrashType={this.props.onInputTrashType}
                />
                <Grid item xs={2}></Grid>
                <Grid item xs={8} style={{textAlign:'center'}}>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={this.props.trashes.length===MAX_SCHEDULE}
                        onClick={()=>this.props.onClickAdd()}>
                        {this.props.t('ScheduleList.button.addtrash')}
                    </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={12} style={{textAlign: 'center'}}>
                    <OAuthLogin {...this.props}/>
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4} style={{textAlign:'center'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={this.props.submit_error || this.props.submitting}
                        onClick={()=>this.props.onSubmit(true)}>
                        {this.props.t('ScheduleList.button.regist')}
                    </Button>
                </Grid>
                <Grid item xs={4}></Grid>
            </Grid>
        );
    }
}

export default withStyles(AppStyle)(withTranslation()(ScheduleList));
