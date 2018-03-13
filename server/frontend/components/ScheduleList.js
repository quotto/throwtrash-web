import React from 'react'
import {Field} from 'redux-form'
import TrashSchedule from './TrashSchedule'
import {Button,Grid} from 'material-ui'
import { withStyles } from 'material-ui/styles';
import { AppStyle } from './style'
import axios from 'axios'

class ScheduleList extends React.Component {
    render() {
        if(this.props.submitting) {
            console.log("submit")
            axios.post("/regist",JSON.stringify(this.props.trashes),{headers:{'Content-Type':'application/json'}})
                .then((response)=> {
                    console.log(response)
                    this.props.onSubmit(true)
                }).catch((error) =>{
                    console.log("error")
                    this.props.onSubmit(false)
                })
        }
        return (
            <Grid container spacing={24}>
                <TrashSchedule
                    trashes={this.props.trashes}
                    onChangeSchedule={this.props.onChangeSchedule}
                    onChangeTrash={this.props.onChangeTrash}
                    onChangeInput={this.props.onChangeInput}
                    onClick={this.props.onClickDelete} />
                <Grid item xs={2}></Grid>
                <Grid item xs={8} style={{"text-align":"center"}}>
                    <Button
                        variant="raised"
                        color="secondary"
                        disabled={this.props.trashes.length===5}
                        onClick={()=>this.props.onClickAdd()}>
                        ゴミの種類を追加
                    </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4} style={{"text-align":"center"}}>
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
        )
    }
}

export default withStyles(AppStyle)(ScheduleList)
