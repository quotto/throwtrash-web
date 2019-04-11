import React from 'react';
import reactToString from 'react-to-string';
const ReactDomServer = require('react-dom/server');
import {
    Select,
    MenuItem,
    Input,
    InputLabel,
    InputAdornment,
    Button,
    Radio,
    RadioGroup,
    FormHelperText,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Hidden,
    Chip
} from '@material-ui/core';
import {isWidthDown} from '@material-ui/core/withWidth';
import {ToggleButton,ToggleButtonGroup} from '@material-ui/lab';
import {withStyles,createMuiTheme} from '@material-ui/core/styles';
import {AppStyle} from './style';
import CalendarToday  from '@material-ui/icons/CalendarToday';
import Delete  from '@material-ui/icons/Delete';

const defaultTheme = createMuiTheme();
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
                <MenuItem value={key}>
                    {this.props.t('TrashSchedule.select.scheduletype.option.'+key)}
                </MenuItem>
            );
        });
        return (
            <FormControl className={this.props.classes.ScheduleTypeFormControl}>
                <InputLabel htmlFor={`schedule-${trash_index}-${schedule_index}`} style={{top: '-5'}}>
                    <Chip
                        avatar={<CalendarToday fontSize="small" style={{marginLeft: '8px',background:'none',width: '20px'}} />}
                        label={this.props.t('TrashSchedule.select.scheduletype.label')+(schedule_index+1)}
                        color='primary'
                        style={{height: '25px'}}
                    />
                </InputLabel>
                <Select
                    id={`schedule-${trash_index}-${schedule_index}`}
                    name={`schedule-${trash_index}-${schedule_index}`}
                    value={target_schedule.type}
                    onChange={(e,children)=>this.props.onChangeSchedule(trash_index,schedule_index,e.target.value)}
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
        let inputTag;
        switch(target_schedule.type) {
        case 'weekday':
            let weekdayOption=[];
            WeekdayType.forEach((key)=> {
                weekdayOption.push(
                    <MenuItem value={key}>
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
                    <FormHelperText error={target_schedule.error}>{target_schedule.error}</FormHelperText>
                </FormControl>
            break;
        case 'biweek':
            let biweekOption = [];
            WeekdayType.forEach((key)=> {
                for(var num=1; num<=5; num++) {
                    biweekOption.push(
                        <MenuItem value={key+'-'+num}>
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
                        {target_schedule.error}
                    </FormHelperText>
                </FormControl>
            break;
        case 'month':
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
                        {target_schedule.error}
                    </FormHelperText>
                </FormControl>
            break;
        case 'evweek':
            let evweekOption = [];
            WeekdayType.forEach((key)=> {
                evweekOption.push(
                    <MenuItem value={key}>
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
                                style={{'font-size':this.props.t('TrashSchedule.style.StyleToggleButton.fontsize')}}
                            >
                                {this.props.t('TrashSchedule.select.evweek.thisweek')}
                            </StyleToggleButton>
                            <StyleToggleButton
                                value='nextweek'
                                style={{'font-size':this.props.t('TrashSchedule.style.StyleToggleButton.fontsize')}}
                            >
                                {this.props.t('TrashSchedule.select.evweek.nextweek')}
                            </StyleToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </div>
            break;
        default:
            inputTag = <div />
            break;
        }

        return (
            inputTag
        );
    }
    createScheduleTags(trash_index) {
        const scheduleTags = [];
        for(let i=0; i<3; i++){
            scheduleTags.push(
                <Hidden><Grid item sm={5} /></Hidden>
            );
            scheduleTags.push(
                <Grid item sm={7} xs={12}>
                    {this.createTrashSchedule(trash_index,i)}
                </Grid>
            );
        }
        return scheduleTags;
    }

    render(props) {
        let trashTag = [];
        for(let i=0; i < this.props.trashes.length; i++) {
            let trashOptionTag = [];
            TrashType.forEach((key)=>{
                trashOptionTag.push(<MenuItem value={key}>{this.props.t('TrashSchedule.select.trashtype.option.'+key)}</MenuItem>);
            });

            const trashTypeTag =
                <div style={{display: 'inlin-block'}}>
                    <FormControl className={this.props.classes.TrashTypeFormControl}>
                        <InputLabel htmlFor={`trash${i}`} style={{top: '-5'}}>
                            <Chip
                                avatar={<Delete fontSize='small' style={{marginLeft: '8px',background:'none',width: '20px'}} />}
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
                        <FormHelperText error={this.props.trashes[i].trash_type_error}>{this.props.trashes[i].trash_type_error}</FormHelperText>
                    </FormControl>
                    {this.props.trashes[i].type==='other' && (
                        <FormControl className={this.props.classes.OtherTrashInputFormControl}>
                            <InputLabel htmlFor={`othertrashtype${i}`}>{this.props.t('TrashSchedule.input.other')}</InputLabel>
                            <Input
                                id={`othertrashtype${i}`}
                                name={`othertrashtype${i}`}
                                placeholder={this.props.t('TrashSchedule.input.other.placeholder')}
                                required={true}
                                inputProps={{maxLength:'10'}}
                                value={this.props.trashes[i].trash_val}
                                onChange={(e)=>{this.props.onInputTrashType(i,e.target.value);}}
                                style={{textAlign:'center'}}
                            />
                            <FormHelperText error={this.props.trashes[i].input_trash_type_error}>{this.props.trashes[i].input_trash_type_error}</FormHelperText>
                        </FormControl>
                    )}
                </div>


            trashTag.push(
                <Grid container justify='center' spacing={24} style={{marginBottom:'10px'}}>
                    <Hidden xsDown>
                        <Grid sm={5} style={{display: 'inline-flex',flexDirection: 'row-reverse',alignItems: 'center'}}>
                            <Button color='secondary' onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Hidden>
                    <Grid item sm={7} xs={12}>
                        {trashTypeTag}
                    </Grid>
                    {this.createScheduleTags(i)}
                    <Hidden smUp>
                        <Grid item sm={12} xs={12} style={{textAlign: 'center'}}>
                            <Button color='secondary' onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Hidden>
                    <Grid item sm={8} xs={12} style={{borderBottom:'1px solid #E91E63'}}/>
                </Grid>
            );
        }
        return(
            trashTag
        );
    }
}

export default withStyles(AppStyle)(withTranslation()(TrashSchedule));
