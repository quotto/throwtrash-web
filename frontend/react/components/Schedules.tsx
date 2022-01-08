import React from 'react';
import { Grid, Button, FormControl, FormLabel, FormGroup, IconButton, Theme } from '@mui/material';
import { withStyles, StyleRules, createStyles, WithStyles} from '@mui/styles';
import {CalendarToday, RadioButtonChecked, RadioButtonUnchecked,HighlightOff}  from '@mui/icons-material';
import { withTranslation, WithTranslation } from 'react-i18next';
import WeekDay from './schedule-inputs/WeekDay';
import EvWeek from './schedule-inputs/EvWeek';
import BiWeek from './schedule-inputs/BiWeek';
import Month from './schedule-inputs/Month';
import { MainProps } from '../containers/MainContainer';
import { Trash } from '../reducers/TrashReducer';

const styles = (theme: Theme): StyleRules=>createStyles({
    TrashScheduleContainer: {
        marginBottom: '20px'
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
        // スケジュール種類のボタンが開始位置から5pxマージンが設定されているため、それに合わせる
        marginLeft: '5px',
        // Material-UI5ではSelectのInputLabel幅を親Gridで考慮しないので部品が重複して描画されないようにpaddingを設定する
        paddingTop: '10px'
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

function ScheduleOption(props: ScheduleTypeButtonProps) {
    const {trash_index,schedule_index,onChangeInput,trash} = props;
    const target_schedule = trash.schedules[props.schedule_index];
    const schedule_type = target_schedule.type;
    if (schedule_type === 'weekday') {
        return (
            <WeekDay
                target_schedule={target_schedule}
                {...props}
            />
        );
    } else if (schedule_type === 'biweek') {
        return (
            <BiWeek
                target_schedule={target_schedule}
                {...props}
            />
        );
    } else if (schedule_type === 'month') {
        return (
            <Month
                target_schedule={target_schedule}
                {...props}
            />
        );
    } else if (schedule_type === 'evweek') {
        return (
            <EvWeek
                target_schedule={target_schedule}
                {...props}
            />
        );
    } else {
        return <div />;
    }
}

interface ScheduleTypeButtonProps extends Props {
    schedule_index: number,
    selected_trash_type: string
    schedule_type: string
}
const ScheduleTypeButton = withStyles(styles)((props: ScheduleTypeButtonProps) =>{
    const {schedule_index, trash_index, selected_trash_type, schedule_type, classes} = props;
    return (<Button
        id={`${schedule_type}-${trash_index}-${schedule_index}`}
        className={classes.TrashTypeButton}
        variant='contained'
        size='small'
        startIcon={selected_trash_type === schedule_type ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
        color={selected_trash_type === schedule_type ? 'primary' : undefined }
        onClick={() => props.onChangeSchedule(trash_index, schedule_index, schedule_type)}
    >
        {props.t(`TrashSchedule.select.scheduletype.option.${schedule_type}`)}
    </Button>);
});

interface Props extends MainProps, WithStyles<typeof styles>, WithTranslation{
    trash: Trash,
    trash_index: number,
}

class Schedules extends React.Component<Props,{}> {
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
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='weekday'
                                        {...this.props}
                                    />
                                    <ScheduleTypeButton
                                        schedule_index={i}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='month'
                                        {...this.props}
                                    />
                                    <ScheduleTypeButton
                                        schedule_index={i}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='biweek'
                                        {...this.props}
                                    />
                                    <ScheduleTypeButton
                                        schedule_index={i}
                                        selected_trash_type={this.props.trash.schedules[i].type}
                                        schedule_type='evweek'
                                        {...this.props}
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}
                            height='auto'
                            className={this.props.classes.ScheduleOptionsGrid}>
                            <ScheduleOption
                                schedule_index={i}
                                selected_trash_type={this.props.trash.schedules[i].type}
                                schedule_type='weekday'
                                {...this.props}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container alignItems='center' justifyContent='center' xs={2}
                        style={{
                            alignItems: 'middle',
                            textAlign: 'center'
                        }}
                    >
                        <IconButton
                            color='error'
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

export default withStyles(styles)(withTranslation()(Schedules));