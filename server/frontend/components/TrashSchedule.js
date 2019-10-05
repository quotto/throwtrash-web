import React from 'react';
import PropTypes from 'prop-types';
import {
    Select,
    MenuItem,
    Input,
    InputLabel,
    InputAdornment,
    Button,
    FormHelperText,
    FormControl,
    Grid,
    Hidden,
    Chip,
    Avatar
} from '@material-ui/core';
import {ToggleButton,ToggleButtonGroup} from '@material-ui/lab';
import {withStyles,createMuiTheme} from '@material-ui/core/styles';
import {AppStyle} from './style';
import CalendarToday  from '@material-ui/icons/CalendarToday';
import Delete  from '@material-ui/icons/Delete';

const defaultTheme = createMuiTheme({
    typography: {
        useNextVariants: true
    }
});
const StyleToggleButton = withStyles({
    selected: {
        color: 'white',
        background: defaultTheme.palette.secondary.main,
        '&:after': {
            background: 'none'
        },
        '&:hover': {
            background: defaultTheme.palette.secondary.main
        }
    }
})(ToggleButton);
import {withTranslation} from 'react-i18next';

const TrashType = [
    'burn','unburn','plastic','bin','can','petbottle','paper','resource','coarse','other'
];

const ScheduleType = ['none','weekday','biweek','month','evweek'];

const WeekdayType =  ['0','1','2','3','4','5','6'];

class TrashSchedule extends React.Component {
    getErrorMessage(message_id,params=[]) {
        let message =  message_id ? this.props.t(`error.${message_id}`) : undefined;
        if(message) {
            for(let i=0; i<params.length; i++){
                message = message.replace('%s',params[i]);
            }
        }
        return message;
    }

    createTrashSchedule(trash_index,schedule_index) {
        return(
            <div className={this.props.classes.TrashScheduleDiv}>
                {this.createSchedule(trash_index,schedule_index)}
                {this.createScheduleOption(trash_index,schedule_index)}
            </div>
        );
    }

    createSchedule(trash_index,schedule_index) {
        let target_schedule = this.props.trashes[trash_index].schedules[schedule_index];
        let scheduleOptionTag = [];
        ScheduleType.forEach((key)=>{
            scheduleOptionTag.push(
                <MenuItem key={key} value={key}>
                    {this.props.t('TrashSchedule.select.scheduletype.option.'+key)}
                </MenuItem>
            );
        });
        return (
            <FormControl className={this.props.classes.ScheduleTypeFormControl}>
                <InputLabel htmlFor={`schedule-${trash_index}-${schedule_index}`} style={{top: '-5'}}>
                    <Chip
                        avatar={
                            <Avatar style={{background: 'none'}}>
                                <CalendarToday fontSize="small" style={{marginLeft: '8px',width: '20px'}} />
                            </Avatar>
                        }
                        label={this.props.t('TrashSchedule.select.scheduletype.label')+(schedule_index+1)}
                        color='primary'
                        style={{height: '25px'}}
                    />
                </InputLabel>
                <Select
                    id={`schedule-${trash_index}-${schedule_index}`}
                    name={`schedule-${trash_index}-${schedule_index}`}
                    value={target_schedule.type}
                    onChange={(e)=>this.props.onChangeSchedule(trash_index,schedule_index,e.target.value)}
                    style={{textAlign:'center'}}
                >
                    {scheduleOptionTag}
                </Select>
                <FormHelperText></FormHelperText>
            </FormControl>
        );
    }

    createScheduleOption(trash_index,schedule_index) {
        let target_schedule = this.props.trashes[trash_index].schedules[schedule_index];
        let inputTag = <div />;
        if(target_schedule.type === 'weekday') {
            let weekdayOption=[];
            WeekdayType.forEach((key)=> {
                weekdayOption.push(
                    <MenuItem key={key} value={key}>
                        {this.props.t('TrashSchedule.select.weekday.option.'+key)}
                    </MenuItem>
                );
            });
            inputTag =
                <FormControl className={this.props.classes.OptionWeekFormControl}>
                    <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>
                        {this.props.t('TrashSchedule.select.weekday.label')}
                    </InputLabel>
                    <Select
                        id={`scinput-${trash_index}-${schedule_index}`}
                        name={`scinput-${trash_index}-${schedule_index}`}
                        value={target_schedule.value}
                        onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,e.target.value)}
                        className={this.props.classes.OptionWeekSelect}
                    >
                        {weekdayOption}
                    </Select>
                    <FormHelperText error={target_schedule.error}>
                        {this.getErrorMessage(target_schedule.error)}
                    </FormHelperText>
                </FormControl>;
        } else if(target_schedule.type === 'biweek') {
            let biweekOption = [];
            WeekdayType.forEach((key)=> {
                for(var num=1; num<=5; num++) {
                    biweekOption.push(
                        <MenuItem key={key+'-'+num} value={key+'-'+num}>
                            {this.props.t('TrashSchedule.select.weekday.number.'+num)+this.props.t('TrashSchedule.select.weekday.option.'+key)}
                        </MenuItem>
                    );
                }
            });
            inputTag =
                <FormControl className={this.props.classes.OptionWeekFormControl}>
                    <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>
                        {this.props.t('TrashSchedule.select.weekday.label')}
                    </InputLabel>
                    <Select
                        id={`scinput-${trash_index}-${schedule_index}`}
                        name={`scinput-${trash_index}-${schedule_index}`}
                        value={target_schedule.value}
                        onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,e.target.value)}
                        className={this.props.classes.OptionWeekSelect}
                    >
                        {biweekOption}
                    </Select>
                    <FormHelperText error={target_schedule.error}>
                        {this.getErrorMessage(target_schedule.error)}
                    </FormHelperText>
                </FormControl>;
        } else if(target_schedule.type === 'month') {
            inputTag =
                <FormControl className={this.props.classes.OptionMonthFormControl}>
                    <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>
                        {this.props.t('TrashSchedule.input.month.label')}
                    </InputLabel>
                    <Input
                        id={`scinput-${trash_index}-${schedule_index}`}
                        name={`scinput-${trash_index}-${schedule_index}`}
                        type="number"
                        placeholder={this.props.t('TrashSchedule.input.month.placeholder')}
                        required={true}
                        value={target_schedule.value}
                        onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,e.target.value)}
                        endAdornment={<InputAdornment position='end'>{this.props.t('TrashSchedule.input.month.suffix')}</InputAdornment>}
                        inputProps={{style:{textAlign:'center',width:'100%'}}}
                    />
                    <FormHelperText error={target_schedule.error}>
                        {this.getErrorMessage(target_schedule.error)}
                    </FormHelperText>
                </FormControl>;
        } else if(target_schedule.type === 'evweek') {
            let evweekOption = [];
            WeekdayType.forEach((key)=> {
                evweekOption.push(
                    <MenuItem key={key} value={key}>
                        {this.props.t('TrashSchedule.select.weekday.option.'+key)}
                    </MenuItem>
                );
            });
            inputTag =
                <div className={this.props.classes.OptionEvWeekDiv}>
                    <FormControl className={this.props.classes.OptionEvweekFormControl}>
                        <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>{this.props.t('TrashSchedule.select.weekday.label')}</InputLabel>
                        <Select
                            id={`scinput-${trash_index}-${schedule_index}`}
                            name={`scinput-${trash_index}-${schedule_index}`}
                            value={target_schedule.value.weekday}
                            style={{textAlign:'center'}}
                            onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,{weekday:e.target.value,start:target_schedule.value.start})}
                        >
                            {evweekOption}
                        </Select>
                    </FormControl>
                    <div style={{display:'inline-flex',flexDirection:'column',alignItems:'start'}}>
                        <FormHelperText style={{margin: '0 0 8px 0'}}>
                            {this.props.t('TrashSchedule.select.evweek.helper')}
                        </FormHelperText>
                        <ToggleButtonGroup
                            value={target_schedule.value.start}
                            exclusive
                            onChange={(e,changed_value)=>{
                                if(changed_value) {
                                    this.props.onChangeInput(trash_index,schedule_index,{weekday:target_schedule.value.weekday,start:changed_value});
                                }
                            }}
                            style={{flexDirection:'column',alignItems:'start'}}
                        >
                            <StyleToggleButton
                                value='thisweek'
                                style={{fontSize:this.props.t('TrashSchedule.style.StyleToggleButton.fontsize')}}
                            >
                                {this.props.t('TrashSchedule.select.evweek.thisweek')}
                            </StyleToggleButton>
                            <StyleToggleButton
                                value='nextweek'
                                style={{fontSize: this.props.t('TrashSchedule.style.StyleToggleButton.fontsize')}}
                            >
                                {this.props.t('TrashSchedule.select.evweek.nextweek')}
                            </StyleToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </div>;
        }

        return (
            inputTag
        );
    }
    createScheduleTags(trash_index) {
        const scheduleTags = [];
        for(let i=0; i<3; i++){
            scheduleTags.push(
                <Hidden key={`Hidden${i}`} xsDown><Grid item sm={5} /></Hidden>
            );
            scheduleTags.push(
                <Hidden smUp><Grid item xs={1} /></Hidden>
            );
            scheduleTags.push(
                <Grid item sm={7} xs={10} key={`Grid${i}`}>
                    {this.createTrashSchedule(trash_index,i)}
                </Grid>
            );
            scheduleTags.push(
                <Hidden smUp><Grid item xs={1} /></Hidden>
            );
        }
        return scheduleTags;
    }

    render() {
        let trashTag = [];
        for(let i=0; i < this.props.trashes.length; i++) {
            let trashOptionTag = [];
            TrashType.forEach((key)=>{
                trashOptionTag.push(
                    <MenuItem key={key} value={key}>
                        {this.props.t('TrashSchedule.select.trashtype.option.'+key)}
                    </MenuItem>);
            });

            const trashTypeTag =
                <div style={{display: 'inlin-block'}}>
                    <FormControl className={this.props.classes.TrashTypeFormControl}>
                        <InputLabel htmlFor={`trash${i}`} style={{top: '-5'}}>
                            <Chip
                                avatar={
                                    <Avatar style={{background: 'none'}}>
                                        <Delete fontSize='small' style={{marginLeft: '8px',width: '20px'}} />
                                    </Avatar>
                                }
                                label={this.props.t('TrashSchedule.select.trashtype.label')+(i+1)}
                                color='secondary'
                                style={{height: '25px'}}
                            />
                        </InputLabel>
                        <Select
                            id={`trash${i}`}
                            name={`trash${i}`}
                            value={this.props.trashes[i].type}
                            onChange={(e)=>{this.props.onChangeTrash(i,e.target.value);}}
                            style={{textAlign:'center'}}
                        >
                            {trashOptionTag}
                        </Select>
                        <FormHelperText error={this.props.trashes[i].trash_type_error}>
                            {this.getErrorMessage(this.props.trashes[i].trash_type_error)}
                        </FormHelperText>
                    </FormControl>
                    {this.props.trashes[i].type==='other' && (
                        <FormControl className={this.props.classes.OtherTrashInputFormControl}>
                            <InputLabel htmlFor={`othertrashtype${i}`}>{this.props.t('TrashSchedule.input.other')}</InputLabel>
                            <Input
                                id={`othertrashtype${i}`}
                                name={`othertrashtype${i}`}
                                placeholder={this.props.t('TrashSchedule.input.other.placeholder')}
                                required={true}
                                inputProps={{
                                    maxLength:this.props.t('TrashSchedule.input.other.maxlength'),
                                    style:{textAlign:'center'}
                                }}
                                value={this.props.trashes[i].trash_val}
                                onChange={(e)=>{
                                    this.props.onInputTrashType(i,e.target.value,this.props.t('TrashSchedule.input.other.maxlength'));
                                }}
                            />
                            <FormHelperText error={this.props.trashes[i].input_trash_type_error}>
                                {this.getErrorMessage(
                                    this.props.trashes[i].input_trash_type_error,
                                    [this.props.t('TrashSchedule.input.other.maxlength')])
                                }
                            </FormHelperText>
                        </FormControl>
                    )}
                </div>;


            trashTag.push(
                <Grid container justify='center' xs={12} spacing={24} style={{marginBottom:'10px'}} key={`trash${i}`}>
                    <Hidden xsDown>
                        <Grid item sm={5} style={{display: 'inline-flex',flexDirection: 'row-reverse',alignItems: 'center'}}>
                            <Button color='secondary' onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Hidden>
                    <Hidden smUp>
                        <Grid item xs={1} />
                    </Hidden>
                    <Grid item sm={7} xs={10}>
                        {trashTypeTag}
                    </Grid>
                    <Hidden smUp>
                        <Grid item xs={1} />
                    </Hidden>
                    {this.createScheduleTags(i)}
                    <Hidden smUp>
                        <Grid item sm={12} xs={12} style={{textAlign: 'center'}}>
                            <Button color='secondary' onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Hidden>
                    <Grid item sm={8} xs={12} style={{borderTop:'1px solid #E91E63'}}/>
                </Grid>
            );
        }
        return(
            trashTag
        );
    }
}

TrashSchedule.propTypes = {
    submitting: PropTypes.bool,
    submit_error: PropTypes.string,
    trashes: PropTypes.array,
    onChangeSchedule: PropTypes.func,
    onChangeTrash: PropTypes.func,
    onChangeInput: PropTypes.func,
    onClickDelete: PropTypes.func,
    onInputTrashType: PropTypes.func,
    onClickAdd: PropTypes.func,
    onClick: PropTypes.func,
    onSubmit: PropTypes.func,
    t: PropTypes.func,
    classes: PropTypes.object
};

export default withStyles(AppStyle)(withTranslation()(TrashSchedule));
