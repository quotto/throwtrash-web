import React from 'react';
import PropTypes from 'prop-types';
import { Grid, withStyles, Button, FormControl, FormLabel, FormGroup, IconButton } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import WeekDay from './schedule-inputs/WeekDay';
import EvWeek from './schedule-inputs/EvWeek';
import BiWeek from './schedule-inputs/BiWeek';
import Month from './schedule-inputs/Month';
import {CalendarToday, RadioButtonChecked, RadioButtonUnchecked,HighlightOff}  from '@material-ui/icons';

const styles = (theme)=>({
    TrashScheduleContainer: {
        paddingBottom: '20px'
    },
    ScheduleTypeFormControl: {
        'vertical-align':'top',
        'text-align':'center',
        [theme.breakpoints.up('sm')] : {
            'width':'40%',
            'min-width':'130px',
            'max-width':'210px'
        },
        [theme.breakpoints.down('xs')]: {
            'width':'100%'
        }
    },
    TrashTypeButton: {
        margin: '5px',
    },
    ScheduleOptionsGrid: {
        // スケジュール種類のボタンが開始位置から5pxマージンがっ設定されているため、それに合わせる
        marginLeft: '5px',
    },
    // FormLabelをInputLabelと同じ見た目とするための設定
    ScheduleTypeFormLabel: {
        transform: 'scale(0.75)',
        transformOrigin: 'top left'
    },
    ScheduleTypeLabel: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: theme.palette.primary.main
    }
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

const ScheduleTypeButton = withStyles(styles)((props) =>{
    const {schedule_index, trash_index, selected_trash_type, schedule_type, classes} = props;
    return (<Button
        id={`${schedule_type}-${trash_index}-${schedule_index}`}
        className={classes.TrashTypeButton}
        variant='contained'
        size='small'
        startIcon={selected_trash_type === schedule_type ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
        color={selected_trash_type === schedule_type ? 'primary' : 'default'}
        onClick={() => props.onChangeSchedule(trash_index, schedule_index, schedule_type)}
    >
        {props.t(`TrashSchedule.select.scheduletype.option.${schedule_type}`)}
    </Button>);
});

ScheduleTypeButton.propTypes = {
    schedule_index: PropTypes.number.isRequired,
    trash_index: PropTypes.number.isRequired,
    selected_trash_type: PropTypes.string.isRequired,
    schedule_type: PropTypes.string.isRequired,
    onChangeSchedule: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    classes: PropTypes.object
};

class Schedules extends React.Component {
    render() {
        const ScheduleTags = [];
        for(let i=0; i<this.props.trash.schedules.length; i++) {
            ScheduleTags.push(
                <Grid container 
                    alignItems='center' 
                    key={`Grid${i}`} 
                    className={this.props.classes.TrashScheduleContainer}
                    style={{backgroundColor: i % 2 === 1? 'white' : '#f5f5f5'}}
                >
                    <Grid item xs={10}>
                        <Grid item container alignItems='center' alignContent='flex-start' xs={12}>
                            <FormControl>
                                <FormLabel 
                                    className={this.props.classes.ScheduleTypeFormLabel}
                                >
                                    <div 
                                        className={this.props.classes.ScheduleTypeLabel}
                                    >
                                        <CalendarToday  
                                            color='primary'
                                            style={{ marginLeft: '8px', width: '20px' }} />
                                        <span>{this.props.t('TrashSchedule.select.scheduletype.label') + (i + 1)}</span>
                                    </div>
                                </FormLabel>
                                <FormGroup row>
                                    <ScheduleTypeButton 
                                        schedule_index={i} 
                                        trash_index={this.props.trash_index}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='weekday' 
                                        onChangeSchedule={this.props.onChangeSchedule}
                                        t={this.props.t}
                                    />
                                    <ScheduleTypeButton 
                                        schedule_index={i} 
                                        trash_index={this.props.trash_index}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='month' 
                                        onChangeSchedule={this.props.onChangeSchedule}
                                        t={this.props.t}
                                    />
                                    <ScheduleTypeButton 
                                        schedule_index={i} 
                                        trash_index={this.props.trash_index}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='biweek' 
                                        onChangeSchedule={this.props.onChangeSchedule}
                                        t={this.props.t}
                                    />
                                    <ScheduleTypeButton 
                                        schedule_index={i} 
                                        trash_index={this.props.trash_index}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='evweek' 
                                        onChangeSchedule={this.props.onChangeSchedule}
                                        t={this.props.t}
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}
                            className={this.props.classes.ScheduleOptionsGrid}>
                            <ScheduleOption
                                schedule_index={i}
                                trash_index={this.props.trash_index}
                                trash={this.props.trash}
                                onChangeInput={this.props.onChangeInput}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton 
                            edge='start'
                            color='secondary'
                            onClick={()=>this.props.deleteSchedule(this.props.trash_index, i)}
                        >
                            <HighlightOff />
                        </IconButton>
                    </Grid>
                </Grid>
            );
        }
        return ScheduleTags;
    }
}

Schedules.propTypes = {
    classes: PropTypes.object,
    trash_index: PropTypes.number.isRequired,
    t: PropTypes.func,
    trash: PropTypes.object,
    onChangeInput: PropTypes.func.isRequired,
    onChangeSchedule: PropTypes.func.isRequired,
    deleteSchedule: PropTypes.func.isRequired
};

export default withStyles(styles)(withTranslation()(Schedules));