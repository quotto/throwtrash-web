import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Grid,MenuItem, FormControl, InputLabel, Chip, Avatar, Select, FormHelperText, TextField } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import { withStyles, createStyles } from '@material-ui/core/styles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { isError, TrashTypeList } from './common';
import { WithStyles } from '@material-ui/styles';
import { MainProps } from '../containers/MainContainer';
import { Trash } from '../reducers/TrashReducer';

const styles = createStyles({
    TrashTypeContainer: {
        marginBottom: '20px',
    },
});

interface Props extends MainProps, WithStyles<typeof styles>,WithTranslation{
    number: number,
    trash: Trash
}
class TrashType extends React.Component<Props,{}> {
    getErrorMessage(message_id?: string | boolean,params=[]) {
        let message =  typeof(message_id)==='string' ? this.props.t(`error.${message_id}`) : undefined;
        if(message) {
            for(let i=0; i<params.length; i++){
                message = message.replace('%s',params[i]);
            }
        }
        return message;
    }
    render() {
        const TRASH_OPTION_TAG: ReactNode[] = [];
        TrashTypeList.forEach((key: string)=>{
            TRASH_OPTION_TAG.push(
                <MenuItem key={key} value={key}>
                    {this.props.t('TrashSchedule.select.trashtype.option.'+key)}
                </MenuItem>
            );
        });
        return (
            <Grid
                container
                className={this.props.classes.TrashTypeContainer}
            >
                <Grid item xs={12}>
                    <FormControl>
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
                            onChange={(e) => { this.props.onChangeTrash(this.props.number, e.target.value as string,[]); }}
                            style={{ textAlign: 'center' }}
                        >
                            {TRASH_OPTION_TAG}
                        </Select>
                        <FormHelperText error={isError(this.props.trash.trash_type_error)}>
                            {this.getErrorMessage(this.props.trash.trash_type_error)}
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    {this.props.trash.type === 'other' && (
                        <TextField
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
                    )}
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(withTranslation()(TrashType));