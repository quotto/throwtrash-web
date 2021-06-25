import React from 'react';
import PropTypes from 'prop-types';
import { Grid, FormControl, InputLabel, withStyles, Select, TextField, MenuItem } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { WeekDayList } from './WeekDayList';

const styles = (theme)=>({
    OptionEvweekFormControl: {
        textAlign:'center',
        marginRight: '10px',
        [theme.breakpoints.down('xs')]: {
            width: '50%'
        }
    },
    OptionEvweekContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            alignItems: 'stretch'
        }
    },
});

class EvWeek extends React.Component {
    render() {
        const intervalList = [];
        [2,3,4].forEach((value,index)=>{
            intervalList.push(
                <MenuItem key={value} value={value}>
                    {this.props.t(`TrashSchedule.select.evweek.intervalValue.${index}`)}
                </MenuItem>);
        });
        return(
            <Grid item xs={12}>
                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                    <InputLabel htmlFor={`interval-${this.props.trash_index}-${this.props.schedule_index}`}>{this.props.t('TrashSchedule.select.evweek.interval')}</InputLabel>
                    <Select
                        id={`interval-${this.props.trash_index}-${this.props.schedule_index}`}
                        name={`interval-${this.props.trash_index}-${this.props.schedule_index}`}
                        value={this.props.target_schedule.value.interval}
                        onChange={(e) => this.props.onChangeInput(this.props.trash_index, this.props.schedule_index, { weekday: this.props.target_schedule.value.weekday, start: this.props.target_schedule.value.start, interval: e.target.value })}
                    >
                        {intervalList}
                    </Select>
                </FormControl>
                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                    <InputLabel htmlFor={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}>{this.props.t('TrashSchedule.select.weekday.label')}</InputLabel>
                    <Select
                        id={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                        label={this.props.t('TrashSchedule.select.weekday.label')}
                        name={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                        value={this.props.target_schedule.value.weekday}
                        onChange={(e) => this.props.onChangeInput(
                            this.props.trash_index,
                            this.props.schedule_index,
                            { weekday: e.target.value, start: this.props.target_schedule.value.start, interval: this.props.target_schedule.value.interval }
                        )}
                    >
                        {WeekDayList(this.props)}
                    </Select>
                </FormControl>
                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                    <TextField
                        id={`recently-${this.props.trash_index}-${this.props.schedule_index}`}
                        label={this.props.t('TrashSchedule.select.evweek.helper')}
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            style: {
                                textAlign: 'center'
                            }
                        }}
                        value={this.props.target_schedule.value.start}
                        onChange={(e) => this.props.onChangeInput(
                            this.props.trash_index,
                            this.props.schedule_index,
                            { weekday: this.props.target_schedule.value.weekday, start: e.target.value,interval: this.props.target_schedule.value.interval}
                        )}
                    />
                </FormControl>
            </Grid>
        );
    }
}

EvWeek.propTypes = {
    classes: PropTypes.object,
    trash_index: PropTypes.number,
    schedule_index: PropTypes.number,
    t: PropTypes.func,
    target_schedule: PropTypes.object,
    onChangeInput: PropTypes.func
};

export default withStyles(styles)(withTranslation()(EvWeek));