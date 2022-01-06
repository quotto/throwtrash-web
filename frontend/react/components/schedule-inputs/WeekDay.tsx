import React from 'react';
import { FormHelperText, Select, FormControl, InputLabel, Theme } from '@mui/material';
import { withStyles, WithStyles, StyleRules, createStyles } from '@mui/styles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getErrorMessage} from '../common';
import { WeekDayList } from './WeekDayList';
import { MainProps } from '../../containers/MainContainer';
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
        return(
            <FormControl className={this.props.classes.OptionWeekFormControl}>
                <InputLabel htmlFor={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}>
                    {this.props.t('TrashSchedule.select.weekday.label')}
                </InputLabel>
                <Select
                    id={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                    name={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                    className={this.props.classes.OptionWeekSelect}
                    value={this.props.target_schedule.value}
                    onChange={(e) => this.props.onChangeInput(this.props.trash_index, this.props.schedule_index, e.target.value as string)}
                >
                    {WeekDayList(this.props.t)}
                </Select>
                <FormHelperText error={typeof(this.props.target_schedule.error) != 'undefined' && this.props.target_schedule.error.length > 0}>
                    {getErrorMessage(this.props.t, this.props.target_schedule.error)}
                </FormHelperText>
            </FormControl>
        );
    }
}

export default withStyles(styles)(withTranslation()(WeekDay));