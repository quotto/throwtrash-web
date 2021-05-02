import React from 'react';
import { withStyles, Grid, Select, MenuItem, IconButton, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { withTranslation } from 'react-i18next';
import {connect} from 'react-redux';
import {addExcludeDate, deleteExcludeDate, submitExcludeDate, changeExcludeDate, initExcludeDate,resetExcludeSubmit} from '../../actions';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {AddCircle,Delete} from '@material-ui/icons';

const styles = (_)=>({
    button: {
        marginRight: '10px',
        marginLeft: '10px',
        marginBottom: '10px',
        marginTop: '10px',
    },
    dateRow: {
        marginBottom: '10px'
    },
    dateComponent: {
        paddingRight: '5px',
        paddingLeft: '5px'
    },
    addButtonRow: {
        marginBottom: '10px'
    },
    topMessageRow: {
        textAlign: 'center'
    },
    topMessageContainer: {
        marginTop: '10px',
        marginBottom: '20px'
    }
});

class ExcludeDate extends React.Component {
    constructor(props) {
        super(props);
        // React.Componentを継承する形式ではHooks APIが使えないためwithRouterとprops配下に渡されるオブジェクトを利用してパラメータを参照する
        const {trashIndex} = props.match.params;
        props.initExcludeDate(trashIndex,props.updateState.trashes[trashIndex].excludes);
    }
    render() {
        const {trashIndex} = this.props.match.params;
        const is_submitted = this.props.updateState.trashes[trashIndex].is_excludes_submitted;
        const is_error = this.props.updateState.trashes[trashIndex].is_excludes_error;
        if(is_submitted) {
            setTimeout((_)=>{
                // 次に例外設定画面を開いた時のサブミット,エラー状態をクリアしておく
                this.props.resetExcludeSubmit(trashIndex);
                this.props.history.goBack();
            },1000);
        }
        const excludesDivList = this.props.excludeState.excludes.map((exclude,index)=>{
            const maxDate = exclude.month == 2 ? 29 : ([1,3,5,7,8,10,12].includes(exclude.month) ? 31 : 30);
            return (
                <Grid item
                    container
                    justify='center'
                    alignItems='center'
                    xs={12} key={`selector-${index}`}
                    className={this.props.classes.dateRow}>
                    <label htmlFor='icon-delete'>
                        <IconButton
                            className={this.props.classes.dateComponent}
                            size='small'
                            color='secondary'
                            arial-label='delete date'
                            component='span'
                            onClick={()=>this.props.deleteExcludeDate(index)}>
                            <Delete />
                        </IconButton>
                    </label>
                    <Select 
                        className={this.props.classes.dateComponent}
                        value={exclude.month} 
                        onChange={(e)=>this.props.changeExcludeDate(index, e.target.value, this.props.excludeState.excludes[index].date)}>
                        {Array.from(Array(12).keys()).map((value) =>
                            <MenuItem value={value + 1} key={`month${value + 1}`}>{value + 1}</MenuItem>
                        )}
                    </Select>
                    <div className={this.props.classes.dateComponent} >月</div>
                    <Select 
                        className={this.props.classes.dateComponent}
                        value={exclude.date}
                        onChange={(e)=>this.props.changeExcludeDate(index, this.props.excludeState.excludes[index].month, e.target.value)}>
                        {Array.from(Array(maxDate).keys()).map((value) =>
                            <MenuItem value={value + 1} key={`date${value + 1}`}>{value + 1}</MenuItem>
                        )}
                    </Select>
                    <div className={this.props.classes.dateComponent}>日</div>
                </Grid>
            );
        });
        return (
            <Grid container justify='center' item xs={12}>
                <Grid container item justify='center' xs={12} className={this.props.classes.topMessageContainer}>
                    <Grid item className={this.props.classes.topMessageRow} xs={12}>
                        <span style={{fontSize: '1.5em'}}>{this.props.t('TrashSchedule.select.trashtype.option.'+this.props.updateState.trashes[trashIndex].type)}</span>
                        <span>の例外日設定</span>
                    </Grid>
                    <Grid item className={this.props.classes.topMessageRow} xs={12}>
                        <span>（最大で10日分設定できます）</span>
                    </Grid>
                </Grid>
                {excludesDivList}
                {this.props.excludeState.excludes.length < 10 ?
                    <Grid container item
                        justify='center'
                        xs={12}
                        className={this.props.classes.addButtonRow}>
                        <label htmlFor='icon-button-add'>
                            <IconButton
                                color='primary'
                                arial-label='add date'
                                component='span'
                                onClick={() => this.props.addExcludeDate()}>
                                <AddCircle />
                            </IconButton>
                        </label>
                    </Grid> : null}
                <Grid container item
                    justify='center'
                    xs={12}>
                    <Button 
                        className={this.props.classes.button} 
                        size='small' 
                        variant='contained' 
                        color='primary'
                        onClick={()=>{
                            if(!is_submitted)  {
                                this.props.submitExcludeDate(this.props.match.params.trashIndex, this.props.excludeState.excludes);
                            }
                        }}>設定する</Button>
                    <Button 
                        className={this.props.classes.button} 
                        size='small' 
                        variant='contained' 
                        color='default'
                        onClick={()=>{
                            // 次に例外設定画面を開いた時のサブミット,エラー状態をクリアしておく
                            this.props.resetExcludeSubmit(trashIndex);
                            this.props.history.goBack();
                        }}>戻る</Button>
                </Grid>
                {is_error ? 
                    <Grid item xs={12}>
                        <Alert severity='error' color='error'>
                            エラーが発生したため設定できません。
                        </Alert>
                    </Grid> : null
                }
                {is_submitted ? 
                    <Grid item xs={12}>
                        <Alert severity='success' color='success'>
                            設定しました。
                        </Alert>
                    </Grid> : null
                }
            </Grid>
        );
    }
}

ExcludeDate.propTypes = {
    t: PropTypes.func,
    classes: PropTypes.object,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    excludeState: PropTypes.object.isRequired,
    updateState: PropTypes.object.isRequired,
    initExcludeDate: PropTypes.func.isRequired,
    changeExcludeDate: PropTypes.func.isRequired,
    addExcludeDate: PropTypes.func.isRequired,
    deleteExcludeDate: PropTypes.func.isRequired,
    submitExcludeDate: PropTypes.func.isRequired,
    resetExcludeSubmit: PropTypes.func.isRequired
};

export default connect(
    state=>({
        excludeState: state.excludeReducer,
        updateState: state.updateState
    }),
    {
        addExcludeDate,
        deleteExcludeDate,
        submitExcludeDate,
        changeExcludeDate,
        initExcludeDate,
        resetExcludeSubmit
    }
)(withStyles(styles)(withTranslation()(withRouter(ExcludeDate))));