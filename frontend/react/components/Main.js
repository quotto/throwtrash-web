/* eslint-disable no-undef */
/** API_HOST,API_STAGEはwebpackのビルドで置き換えられる文字列のためエラーは無視する **/
import React from 'react';
import PropTypes from 'prop-types';
import TrashSchedule from './TrashSchedule';
import {withStyles,Button,Grid,Checkbox,FormControlLabel, Tooltip} from '@material-ui/core';
import axios from 'axios';
import {withTranslation} from 'react-i18next';
import ErrorDialog from './ErrorDialog';
import { green } from '@material-ui/core/colors';

const styles = {
    TopMessage: {
        textAlign:'center',
    }
};


const MAX_SCHEDULE = 10;
class Main extends React.Component {
    render() {
        if(this.props.submitting) {
            axios.post(
                `https://${API_HOST}/${API_STAGE}/regist`,
                JSON.stringify({ data: this.props.trashes, offset: new Date().getTimezoneOffset(), nextdayflag: this.props.nextday_checked }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            ).then((response) => {
                window.location = response.data;
            }).catch(() => {
                this.props.onError(true);
                this.props.onSubmit(false);
            });
        }
        return (
            <Grid container justify='center' item xs={12} spacing={0} style={{flexBasis: '90%'}}>
                <Grid item xs={12} className={this.props.classes.TopMessage}>
                    <ul style={{ display: 'inline-block', textAlign: 'left' }}>
                        <li>{this.props.t('App.description.trash')}</li>
                        <li>{this.props.t('App.description.schedule')}</li>
                    </ul>
                </Grid>
                <div
                    data-title={this.props.t('IntroJS.main.title')}
                    data-intro={this.props.t('IntroJS.main.hint')}
                    data-step={1}
                >
                    <TrashSchedule
                        trashes={this.props.trashes}
                        onChangeSchedule={this.props.onChangeSchedule}
                        onChangeTrash={this.props.onChangeTrash}
                        onChangeInput={this.props.onChangeInput}
                        onClick={this.props.onClickDelete}
                        onInputTrashType={this.props.onInputTrashType}
                        addSchedule={this.props.addSchedule}
                        deleteSchedule={this.props.deleteSchedule}
                    />
                </div>
                <Grid container justify='center' direction='column' alignItems='center' spacing={3}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={this.props.trashes.length === MAX_SCHEDULE}
                            onClick={() => this.props.onClickAdd()}>
                            {this.props.t('ScheduleList.button.addtrash')}
                        </Button>
                    </Grid>
                    <Grid item
                        data-title={this.props.t('IntroJS.nextday.title')}
                        data-intro={this.props.t('IntroJS.nextday.hint')}
                        data-step={2}
                    >
                        <Tooltip
                            title={this.props.t('App.checkbox.description')}
                            placement='top'
                            arial-label='description'>
                            <FormControlLabel
                                control={<Checkbox
                                    checked={this.props.nextday_checked}
                                    style={{color:green[600]}}
                                    onChange={(event)=>this.props.onChangeNextdayCheck(event.target.checked)}/>
                                }
                                label={this.props.t('App.checkbox.nextday')} />
                        </Tooltip>
                    </Grid>
                    <ErrorDialog
                        showErrorDialog={this.props.showErrorDialog}
                        onError={this.props.onError}
                    />
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={this.props.submit_error || this.props.submitting}
                            onClick={() => this.props.onSubmit(true)}>
                            {this.props.t('ScheduleList.button.regist')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

Main.propTypes = {
    submitting: PropTypes.bool,
    submit_error: PropTypes.bool.isRequired,
    trashes: PropTypes.array,
    onChangeNextdayCheck: PropTypes.func,
    onChangeSchedule: PropTypes.func,
    onChangeTrash: PropTypes.func,
    onChangeInput: PropTypes.func,
    onClickDelete: PropTypes.func,
    onInputTrashType: PropTypes.func,
    onClickAdd: PropTypes.func,
    onError: PropTypes.func,
    onSubmit: PropTypes.func,
    addSchedule: PropTypes.func,
    deleteSchedule: PropTypes.func,
    t: PropTypes.func,
    classes: PropTypes.object,
    showErrorDialog: PropTypes.bool,
    nextday_checked: PropTypes.bool
};

export default withStyles(styles)(withTranslation()(Main));
