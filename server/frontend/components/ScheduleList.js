import React from 'react';
import TrashSchedule from './TrashSchedule';
import {Button,Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AppStyle } from './style';
import axios from 'axios';

const MAX_SCHEDULE = 10;
class ScheduleList extends React.Component {
    render() {
        if(this.props.submitting) {
            axios.post('/regist',JSON.stringify(this.props.trashes),{headers:{'Content-Type':'application/json'}})
                .then((response)=> {
                    window.location=response.data;
                }).catch((error) =>{
                    alert('登録に失敗しました。','お知らせ');
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
                        variant="raised"
                        color="secondary"
                        disabled={this.props.trashes.length===MAX_SCHEDULE}
                        onClick={()=>this.props.onClickAdd()}>
                        ゴミの種類を追加
                    </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4} style={{textAlign:'center'}}>
                    <Button
                        variant="raised"
                        color="primary"
                        disabled={this.props.submit_error || this.props.submitting}
                        onClick={()=>this.props.onSubmit(true)}>
                            登録
                    </Button>
                </Grid>
                <Grid item xs={4}></Grid>
            </Grid>
        );
    }
}

export default withStyles(AppStyle)(ScheduleList);
