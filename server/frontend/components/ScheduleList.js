import React from 'react';
import PropTypes from 'prop-types';
import TrashSchedule from './TrashSchedule';
import {Button,Grid} from '@material-ui/core';
import axios from 'axios';
import {withTranslation} from 'react-i18next';

const MAX_SCHEDULE = 10;
class ScheduleList extends React.Component {
    render() {
        if(this.props.submitting) {
            axios.post(
                '/regist',
                JSON.stringify({ data: this.props.trashes, offset: new Date().getTimezoneOffset() }),
                { headers: { 'Content-Type': 'application/json' } }
            ).then((response) => {
                window.location = response.data;
            }).catch(() => {
                alert(this.props.t('ScheduleList.error.registrationfailed.text'), this.props.t('ScheduleList.error.registrationfailed.title'));
                this.props.onSubmit(false);
            });
        }
        return (
            <Grid container justify='center' item xs={12} spacing={24}>
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

ScheduleList.propTypes = {
    submitting: PropTypes.bool,
    submit_error: PropTypes.bool.isRequired,
    trashes: PropTypes.array,
    onChangeSchedule: PropTypes.func,
    onChangeTrash: PropTypes.func,
    onChangeInput: PropTypes.func,
    onClickDelete: PropTypes.func,
    onInputTrashType: PropTypes.func,
    onClickAdd: PropTypes.func,
    onSubmit: PropTypes.func,
    t: PropTypes.func,
    classes: PropTypes.object
};

export default withTranslation()(ScheduleList);
