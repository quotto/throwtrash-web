import React from 'react';
import { TextField,  InputAdornment, Theme } from '@mui/material';
import { withStyles, WithStyles, StyleRules, createStyles} from '@mui/styles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getErrorMessage, isError } from '../common';
import { MainProps } from '../../types/props';
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
        const { classes, t, trash_index, schedule_index, target_schedule, onChangeInput } = this.props;
        return(
            <TextField
                id={`scinput-${trash_index}-${schedule_index}`}
                name={`scinput-${trash_index}-${schedule_index}`}
                className={classes.OptionMonthFormControl}
                label={t('TrashSchedule.input.month.label')}
                type="number"
                placeholder={t('TrashSchedule.input.month.placeholder')}
                required={true}
                value={target_schedule.value}
                onChange={(e) => onChangeInput(trash_index, schedule_index, e.target.value)}
                inputProps={{
                    style: { textAlign: 'center', width: '100%' }
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>{t('TrashSchedule.input.month.suffix')}</InputAdornment>
                    )
                }}
                InputLabelProps={{
                    shrink: true
                }}
                error={isError(target_schedule.error)}
                helperText={getErrorMessage(t, target_schedule.error)}
            />
        );
    }
}

export default withStyles(styles)(withTranslation()(Month));
