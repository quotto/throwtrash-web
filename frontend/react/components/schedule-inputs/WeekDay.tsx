import React from 'react';
import { FormHelperText, Select, FormControl, InputLabel, Theme } from '@mui/material';
import { withStyles, WithStyles, StyleRules, createStyles } from '@mui/styles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getErrorMessage} from '../common';
import { WeekDayList } from './WeekDayList';
import { MainProps } from '../../types/props';
import { Schedule } from '../../reducers/TrashReducer';

const styles = (theme: Theme):StyleRules=>createStyles({
    OptionWeekFormControl: {
        'display':'inline-block',
        'vertical-align':'top',
        [theme.breakpoints.up('sm')] : {
            'width':'40%',
            'min-width':'130px',
            'max-width':'210px'
        },
        [theme.breakpoints.down('xs')]: {
            'width':'50%'
        }
    },
    OptionWeekSelect: {
        'width': '100%',
        'text-align': 'center'
    }
});

interface Props extends MainProps, WithStyles<typeof styles>,WithTranslation {
    trash_index: number,
    schedule_index: number,
    target_schedule: Schedule
}
class WeekDay extends React.Component<Props,{}> {
    render() {
        const { classes, t, trash_index, schedule_index, target_schedule, onChangeInput } = this.props;
        return(
            <FormControl className={classes.OptionWeekFormControl}>
                <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>
                    {t('TrashSchedule.select.weekday.label')}
                </InputLabel>
                <Select
                    id={`scinput-${trash_index}-${schedule_index}`}
                    label={t('TrashSchedule.select.weekday.label')}
                    name={`scinput-${trash_index}-${schedule_index}`}
                    className={classes.OptionWeekSelect}
                    value={target_schedule.value}
                    onChange={(e) => onChangeInput(trash_index, schedule_index, e.target.value as string)}
                >
                    {WeekDayList(t)}
                </Select>
                <FormHelperText error={typeof(target_schedule.error) != 'undefined' && target_schedule.error.length > 0}>
                    {getErrorMessage(t, target_schedule.error)}
                </FormHelperText>
            </FormControl>
        );
    }
}

export default withStyles(styles)(withTranslation()(WeekDay));
