import React from 'react';
import PropTypes from 'prop-types';
import { TextField, withStyles, InputAdornment, WithStyles, Theme, StyleRules, createStyles } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getErrorMessage, isError } from '../common';
import { MainProps } from '../../containers/MainContainer';
import { Schedule } from '../../reducers/TrashReducer';

const styles = (theme: Theme): StyleRules=>createStyles({
    OptionMonthFormControl: {
        'display':'inline-block',
        'vertical-align':'top',
        [theme.breakpoints.up('sm')] : {
            'text-align':'center',
            'width':'40%',
            'min-width':'130px',
            'max-width':'210px'
        },
        [theme.breakpoints.down('xs')]: {
            'text-align':'left',
            'width':'50%'
        }
    }
});

interface Props extends MainProps , WithStyles<typeof styles>,WithTranslation {
    trash_index: number,
    schedule_index: number,
    target_schedule: Schedule
}
class Month extends React.Component<Props,{}> {
    render() {
        return(
            <TextField
                id={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                name={`scinput-${this.props.trash_index}-${this.props.schedule_index}`}
                className={this.props.classes.OptionMonthFormControl}
                label={this.props.t('TrashSchedule.input.month.label')}
                type="number"
                placeholder={this.props.t('TrashSchedule.input.month.placeholder')}
                required={true}
                value={this.props.target_schedule.value}
                onChange={(e) => this.props.onChangeInput(this.props.trash_index, this.props.schedule_index, e.target.value)}
                inputProps={{
                    style: { textAlign: 'center', width: '100%' },
                    endAdornment: (
                        <InputAdornment position='end'>{this.props.t('TrashSchedule.input.month.suffix')}</InputAdornment>
                    )
                }}
                InputLabelProps={{
                    shrink: true
                }}
                error={isError(this.props.target_schedule.error)}
                helperText={getErrorMessage(this.props.t, this.props.target_schedule.error)}
            />
        );
    }
}

export default withStyles(styles)(withTranslation()(Month));