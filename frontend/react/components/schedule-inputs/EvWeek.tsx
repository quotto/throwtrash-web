import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Grid, FormControl, InputLabel, withStyles, Select, TextField, MenuItem, Theme, StyleRules, createStyles, WithStyles } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';
import { WeekDayList } from './WeekDayList';
import { MainProps } from '../../containers/MainContainer';
import { Schedule,EvWeek as EvWeekType  } from '../../reducers/TrashReducer';

const styles = (theme: Theme): StyleRules=>createStyles({
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

interface Props extends MainProps , WithStyles<typeof styles>,WithTranslation {
    trash_index: number,
    schedule_index: number,
    target_schedule: Schedule
}
class EvWeek extends React.Component<Props,{}> {
    render() {
        const intervalList: ReactNode[] = [];
        [2,3,4].forEach((value,index)=>{
            intervalList.push(
                <MenuItem key={value} value={value}>
                    {this.props.t(`TrashSchedule.select.evweek.intervalValue.${index}`)}
                </MenuItem>);
        });
        const evweek_value = this.props.target_schedule.value as EvWeekType;
        return(
            <Grid item xs={12}>
                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                    <InputLabel htmlFor={`interval-${this.props.trash_index}-${this.props.schedule_index}`}>{this.props.t('TrashSchedule.select.evweek.interval')}</InputLabel>
                    <Select
                        id={`interval-${this.props.trash_index}-${this.props.schedule_index}`}
                        name={`interval-${this.props.trash_index}-${this.props.schedule_index}`}
                        value={evweek_value.interval}
                        onChange={(e) => this.props.onChangeInput(this.props.trash_index, this.props.schedule_index, { weekday: evweek_value.weekday, start: evweek_value.start, interval: e.target.value as number })}
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
                        value={evweek_value.weekday}
                        onChange={(e) => this.props.onChangeInput(
                            this.props.trash_index,
                            this.props.schedule_index,
                            { weekday: e.target.value as string, start: evweek_value.start, interval: evweek_value.interval }
                        )}
                    >
                        {WeekDayList(this.props.t)}
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
                        value={evweek_value.start}
                        onChange={(e) => this.props.onChangeInput(
                            this.props.trash_index,
                            this.props.schedule_index,
                            { weekday: evweek_value.weekday, start: e.target.value,interval: evweek_value.interval}
                        )}
                    />
                </FormControl>
            </Grid>
        );
    }
}

export default withStyles(styles)(withTranslation()(EvWeek));