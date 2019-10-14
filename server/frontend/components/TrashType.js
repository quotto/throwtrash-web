import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem, FormControl, InputLabel, Chip, Avatar, Select, FormHelperText, Input } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import { withStyles,createMuiTheme } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

const defaultTheme = createMuiTheme();
const styles = {
    TrashTypeFormControl: {
        [defaultTheme.breakpoints.up('sm')] : {
            'margin-right':'10px',
            'width': '40%',
            'min-width':'130px',
            'max-width':'210px',
        },
        [defaultTheme.breakpoints.down('xs')] : {
            'width': '100%',
        }
    },
};

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
            <div style={{ display: 'inlin-block' }}>
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
                    <FormHelperText error={this.props.trash.trash_type_error}>
                        {this.getErrorMessage(this.props.trash.trash_type_error)}
                    </FormHelperText>
                </FormControl>
                {this.props.trash.type === 'other' && (
                    <FormControl className={this.props.classes.OtherTrashInputFormControl}>
                        <InputLabel htmlFor={`othertrashtype${this.props.number}`}>{this.props.t('TrashSchedule.input.other')}</InputLabel>
                        <Input
                            id={`othertrashtype${this.props.number}`}
                            name={`othertrashtype${this.props.number}`}
                            placeholder={this.props.t('TrashSchedule.input.other.placeholder')}
                            required={true}
                            inputProps={{
                                maxLength: this.props.t('TrashSchedule.input.other.maxlength'),
                                style: { textAlign: 'center' }
                            }}
                            value={this.props.trash.trash_val}
                            onChange={(e) => {
                                this.props.onInputTrashType(this.props.number, e.target.value, this.props.t('TrashSchedule.input.other.maxlength'));
                            }}
                        />
                        <FormHelperText error={this.props.trash.input_trash_type_error}>
                            {this.getErrorMessage(
                                this.props.trash.input_trash_type_error,
                                [this.props.t('TrashSchedule.input.other.maxlength')])
                            }
                        </FormHelperText>
                    </FormControl>
                )}
            </div>
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