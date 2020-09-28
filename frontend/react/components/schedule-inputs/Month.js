import React from 'react';
import PropTypes from 'prop-types';
import { TextField, withStyles, InputAdornment } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { getErrorMessage, isError } from '../common';

const styles = (theme)=>({
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

class Month extends React.Component {
    render() {
        return(
            // <FormControl className={this.props.classes.OptionMonthFormControl}>
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
                endAdornment={<InputAdornment position='end'>{this.props.t('TrashSchedule.input.month.suffix')}</InputAdornment>}
                inputProps={{ style: { textAlign: 'center', width: '100%' } }}
                InputLabelProps={{
                    shrink: true
                }}
                error={isError(this.props.target_schedule.error)}
                helperText={getErrorMessage(this.props, this.props.target_schedule.error)}
            />
        );
    }
}

Month.propTypes = {
    classes: PropTypes.object,
    trash_index: PropTypes.number,
    schedule_index: PropTypes.number,
    t: PropTypes.func,
    target_schedule: PropTypes.object,
    onChangeInput: PropTypes.func
};

export default withStyles(styles)(withTranslation()(Month));