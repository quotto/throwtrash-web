import React from 'react';
import PropTypes from 'prop-types';
import { FormHelperText,FormControl, InputLabel, withStyles, Select } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { WeekDayList } from './WeekDayList';

const styles = (theme)=>({
    OptionEvWeekDiv: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        [theme.breakpoints.up('sm')] : {
            width: '60%',
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            alignItems:'flex-start'
        }
    },
    OptionEvweekFormControl: {
        textAlign:'center',
        width:'50%',
        marginRight: '10px',
        [theme.breakpoints.down('xs')]: {
            textAlign:'left',
            'width':'50%',
            'min-width':'none',
            'max-width':'none',
            'margin-bottom':'8px'
        }
    },
    OptionEvWeekSelect: {
        [theme.breakpoints.down('xs')]: {
            'width':'100%',
            'text-align':'center'
        }
    }
});


const ToggleFormControl = withStyles(
    (theme)=>({
        root: {
            [theme.breakpoints.down('xs')]: {
                paddingBottom: '10px'
            },
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'start'
        }
    })
)(FormControl);

const StyleToggleButton = withStyles(
    (theme) => ({
        selected: {
            color: 'white',
            background: theme.palette.secondary.main,
            '&:after': {
                background: 'none'
            },
            '&:hover': {
                background: theme.palette.secondary.main
            }
        },
    })
)(ToggleButton);

class EvWeek extends React.Component {
    render() {
        return(
            <div className={this.props.classes.OptionEvWeekDiv}>
                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                    <InputLabel htmlFor={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}>{this.props.t('TrashSchedule.select.weekday.label')}</InputLabel>
                    <Select
                        id={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                        name={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                        value={this.props.target_schedule.value.weekday}
                        style={{ textAlign: 'center' }}
                        onChange={(e) => this.props.onChangeInput(
                            this.props.trash_index, 
                            this.props.schedule_index, 
                            { weekday: e.target.value, start: this.props.target_schedule.value.start }
                        )}
                    >
                        {WeekDayList(this.props)}
                    </Select>
                </FormControl>
                <ToggleFormControl>
                    <FormHelperText style={{ margin: '0 0 8px 0' }}>
                        {this.props.t('TrashSchedule.select.evweek.helper')}
                    </FormHelperText>
                    <ToggleButtonGroup
                        value={this.props.target_schedule.value.start}
                        exclusive
                        onChange={(e, changed_value) => {
                            if (changed_value) {
                                this.props.onChangeInput(
                                    this.props.trash_index, 
                                    this.props.schedule_index, 
                                    { weekday: this.props.target_schedule.value.weekday, start: changed_value }
                                );
                            }
                        }}
                        style={{ flexDirection: 'column', alignItems: 'start' }}
                    >
                        <StyleToggleButton
                            value='thisweek'
                            style={{ fontSize: this.props.t('TrashSchedule.style.StyleToggleButton.fontsize') }}
                        >
                            {this.props.t('TrashSchedule.select.evweek.thisweek')}
                        </StyleToggleButton>
                        <StyleToggleButton
                            value='nextweek'
                            style={{ fontSize: this.props.t('TrashSchedule.style.StyleToggleButton.fontsize') }}
                        >
                            {this.props.t('TrashSchedule.select.evweek.nextweek')}
                        </StyleToggleButton>
                    </ToggleButtonGroup>
                </ToggleFormControl>
            </div>
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