import React from 'react';
import PropTypes from 'prop-types';
import { Grid,MenuItem, FormControl, InputLabel, Chip, Avatar, Select, FormHelperText, TextField, Hidden } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { isError } from './common';

const styles = (theme)=>({
    TrashTypeContainer: {
        marginBottom: '20px'
    },
    TrashTypeFormControl: {
        [theme.breakpoints.up('sm')] : {
            'width': '40%',
            'min-width':'130px',
            'max-width':'210px',
        },
        [theme.breakpoints.down('xs')] : {
            'width': '100%',
        }
    },
});

const TRASH_OPTION = [
    'burn','unburn','plastic','bin','can','petbottle','paper','resource','coarse','other'
];

class TrashType extends React.Component {
    getErrorMessage(message_id,params=[]) {
        let message =  message_id ? this.props.t(`error.${message_id}`) : undefined;
        if(message) {
            for(let i=0; i<params.length; i++){
                message = message.replace('%s',params[i]);
            }
        }
        return message;
    }
    render() {
        const TRASH_OPTION_TAG = [];
        TRASH_OPTION.forEach((key)=>{
            TRASH_OPTION_TAG.push(
                <MenuItem key={key} value={key}>
                    {this.props.t('TrashSchedule.select.trashtype.option.'+key)}
                </MenuItem>);
        });
        return (
            <Grid container justify='center' alignItems='center' className={this.props.classes.TrashTypeContainer}>
                <Hidden xsDown><Grid item sm={5} /></Hidden>
                <Grid item sm={7} xs={12}>
                    <FormControl className={this.props.classes.TrashTypeFormControl}>
                        <InputLabel htmlFor={`trash${this.props.number}`} style={{ top: '-5' }}>
                            <Chip
                                avatar={
                                    <Avatar style={{ background: 'none' }}>
                                        <Delete fontSize='small' style={{ marginLeft: '8px', width: '20px' }} />
                                    </Avatar>
                                }
                                label={this.props.t('TrashSchedule.select.trashtype.label') + (this.props.number + 1)}
                                color='secondary'
                                style={{ height: '25px' }}
                            />
                        </InputLabel>
                        <Select
                            id={`trash${this.props.number}`}
                            name={`trash${this.props.number}`}
                            value={this.props.trash.type}
                            onChange={(e) => { this.props.onChangeTrash(this.props.number, e.target.value); }}
                            style={{ textAlign: 'center' }}
                        >
                            {TRASH_OPTION_TAG}
                        </Select>
                        <FormHelperText error={isError(this.props.trash.trash_type_error)}>
                            {this.getErrorMessage(this.props.trash.trash_type_error)}
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Hidden xsDown><Grid item sm={5} /></Hidden>
                <Grid item sm={7} xs={12}>
                    {this.props.trash.type === 'other' && (
                        <TextField 
                            className={this.props.classes.TrashTypeFormControl}
                            id={`othertrashtype${this.props.number}`}
                            name={`othertrashtype${this.props.number}`}
                            label={this.props.t('TrashSchedule.input.other.placeholder')}
                            required={true}
                            inputProps={{
                                maxLength: this.props.t('TrashSchedule.input.other.maxlength'),
                                style: { textAlign: 'center' }
                            }}
                            InputLabelProps={{
                                shrink: true
                            }}
                            value={this.props.trash.trash_val}
                            onChange={(e) => {
                                this.props.onInputTrashType(this.props.number, e.target.value, this.props.t('TrashSchedule.input.other.maxlength'));
                            }}
                            helperText= {this.getErrorMessage(
                                this.props.trash.input_trash_type_error,
                                [this.props.t('TrashSchedule.input.other.maxlength')])
                            }
                            error={isError(this.props.trash.input_trash_type_error)}
                        />
                        // </FormControl>
                    )}
                </Grid>
            </Grid>
        );
    }
}

TrashType.propTypes = {
    trash: PropTypes.object,
    onChangeTrash: PropTypes.func,
    onInputTrashType: PropTypes.func,
    t: PropTypes.func,
    classes: PropTypes.object,
    number: PropTypes.number
};
export default withStyles(styles)(withTranslation()(TrashType));