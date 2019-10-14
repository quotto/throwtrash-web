import React from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, Select, FormControl, InputLabel, withStyles, createMuiTheme } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { getErrorMessage } from '../common';
import { BiWeekList } from './WeekDayList';

const defaultTheme = createMuiTheme();
const styles = {
    OptionWeekFormControl: {
        'display':'inline-block',
        'vertical-align':'top',
        [defaultTheme.breakpoints.up('sm')] : {
            'width':'40%',
            'min-width':'130px',
            'max-width':'210px'
        },
        [defaultTheme.breakpoints.down('xs')]: {
            'text-align':'left',
            'width':'50%'
        }
    },
    OptionWeekSelect: {
        'width':'100%',
        'text-align':'center'
    }
};

class BiWeek extends React.Component {
    render() {
        return (
            <FormControl className={this.props.classes.OptionWeekFormControl}>
                <InputLabel htmlFor={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}>
                    {this.props.t('TrashSchedule.select.weekday.label')}
                </InputLabel>
                <Select
                    id={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                    name={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                    value={this.props.target_schedule.value}
                    onChange={(e) => this.props.onChangeInput(this.props.trash_index, this.props.schedule_index, e.target.value)}
                    className={this.props.classes.OptionWeekSelect}
                >
                    {BiWeekList(this.props)}
                </Select>
                <FormHelperText error={this.props.target_schedule.error}>
                    {getErrorMessage(this.props,this.props.target_schedule.error)}
                </FormHelperText>
            </FormControl>
        );
    }
}

BiWeek.propTypes = {
    trash_index: PropTypes.number,
    schedule_index: PropTypes.number,
    t: PropTypes.func,
    classes: PropTypes.object,
    target_schedule: PropTypes.object,
    onChangeInput: PropTypes.func
};

export default withStyles(styles)(withTranslation()(BiWeek));