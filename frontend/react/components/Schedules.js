import React from 'react';
import PropTypes from 'prop-types';
import { Hidden, Grid, withStyles, FormHelperText, Select, Chip, InputLabel, Avatar, MenuItem, FormControl } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import WeekDay from './schedule-inputs/WeekDay';
import EvWeek from './schedule-inputs/EvWeek';
import BiWeek from './schedule-inputs/BiWeek';
import Month from './schedule-inputs/Month';
import CalendarToday  from '@material-ui/icons/CalendarToday';
import { ScheduleType } from './common';

const styles = (theme)=>({
    TrashSchedule: {
        display: 'flex',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
            alignItems: 'baseline'
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column'
        }
    },
    ScheduleTypeFormControl: {
        'vertical-align':'top',
        'text-align':'center',
        [theme.breakpoints.up('sm')] : {
            'margin-right':'10px',
            'width':'40%',
            'min-width':'130px',
            'max-width':'210px'
        },
        [theme.breakpoints.down('xs')]: {
            'width':'100%'
        }
    },
});

function ScheduleOption(props) {
    const {trash_index,schedule_index,onChangeInput,trash} = props;
    const target_schedule = trash.schedules[props.schedule_index];
    const schedule_type = target_schedule.type;
    if (schedule_type === 'weekday') {
        return (
            <WeekDay
                trash_index={trash_index}
                schedule_index={schedule_index}
                target_schedule={target_schedule}
                onChangeInput={onChangeInput}
                key={`${trash_index}-${schedule_index}`}
            />
        );
    } else if (schedule_type === 'biweek') {
        return (
            <BiWeek
                trash_index={trash_index}
                schedule_index={schedule_index}
                target_schedule={target_schedule}
                onChangeInput={onChangeInput}
                key={`${trash_index}-${schedule_index}`}
            />
        );
    } else if (schedule_type === 'month') {
        return (
            <Month
                trash_index={trash_index}
                schedule_index={schedule_index}
                target_schedule={target_schedule}
                onChangeInput={onChangeInput}
                key={`${trash_index}-${schedule_index}`}
            />
        );
    } else if (schedule_type === 'evweek') {
        return (
            <EvWeek
                trash_index={trash_index}
                schedule_index={schedule_index}
                target_schedule={target_schedule}
                onChangeInput={onChangeInput}
                key={`${trash_index}-${schedule_index}`}
            />
        );
    } else {
        return <div />;
    }
}

class Schedules extends React.Component {
    render() {
        const ScheduleTags = [];
        for(let i=0; i<3; i++) {
            ScheduleTags.push(
                <Grid container spacing={0} key={i.toString()}>
                    <Hidden key={`Hidden${i}`} xsDown><Grid item sm={5} /></Hidden>
                    <Hidden smUp><Grid item xs={1} /></Hidden>
                    <Grid item sm={7} xs={10} key={`Grid${i}`} className={this.props.classes.TrashSchedule}>
                        <FormControl className={this.props.classes.ScheduleTypeFormControl}>
                            <InputLabel htmlFor={`schedule-${this.props.trash_index}-${i}`} style={{ top: '-5' }}>
                                <Chip
                                    avatar={
                                        <Avatar style={{ background: 'none' }}>
                                            <CalendarToday fontSize="small" style={{ marginLeft: '8px', width: '20px' }} />
                                        </Avatar>
                                    }
                                    label={this.props.t('TrashSchedule.select.scheduletype.label') + (i + 1)}
                                    color='primary'
                                    style={{ height: '25px' }}
                                />
                            </InputLabel>
                            <Select
                                id={`schedule-${this.props.trash_index}-${i}`}
                                name={`schedule-${this.props.trash_index}-${i}`}
                                value={this.props.trash.schedules[i].type}
                                onChange={(e) => this.props.onChangeSchedule(this.props.trash_index, i, e.target.value)}
                                style={{ textAlign: 'center' }}
                            >
                                {ScheduleType.map((key) => 
                                    <MenuItem key={key} value={key}>
                                        {this.props.t('TrashSchedule.select.scheduletype.option.' + key)}
                                    </MenuItem>
                                )};
                            </Select>
                            <FormHelperText></FormHelperText>
                        </FormControl>
                        <ScheduleOption 
                            schedule_index={i}
                            trash_index={this.props.trash_index}
                            trash={this.props.trash}
                            onChangeInput={this.props.onChangeInput}
                        />
                    </Grid>
                    <Hidden smUp><Grid item xs={1} /></Hidden>
                </Grid>
            );
        }
        return ScheduleTags;
    }
}

Schedules.propTypes = {
    classes: PropTypes.object,
    trash_index: PropTypes.number,
    t: PropTypes.func,
    trash: PropTypes.object,
    onChangeInput: PropTypes.func,
    onChangeSchedule: PropTypes.func
};

export default withStyles(styles)(withTranslation()(Schedules));