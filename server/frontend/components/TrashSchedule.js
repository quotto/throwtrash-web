import React from 'react';
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
import {
    ToggleButton,
    ToggleButtonGroup
} from "@material-ui/lab";
import {
    withStyles,
    createMuiTheme
} from '@material-ui/core/styles';
import { AppStyle } from './style';
import CalendarToday  from '@material-ui/icons/CalendarToday';
import Delete  from '@material-ui/icons/Delete';

const defaultTheme = createMuiTheme();
const StyleToggleButton = withStyles({
  selected: {
    color: "white",
    background: defaultTheme.palette.secondary.main,
    '&:after': {
        background: "none"
    }
  }
})(ToggleButton)
const XsHiddenGrid = withStyles({
    item: {
        [defaultTheme.breakpoints.down('xs')] : {
            display: "none"
        }
    }
})(Grid)

const TrashType = {
    burn : 'もえるゴミ',
    unburn: 'もえないゴミ',
    plastic: 'プラスチック',
    bottole: 'ビン・カン',
    bin: 'ビン',
    can: 'カン',
    petbottle: 'ペットボトル',
    paper: '古紙',
    resource: '資源ごみ',
    coarse: '粗大ごみ',
    other: 'その他（自分で入力）'
}

const ScheduleType = {
    none: undefined,
    weekday: '毎週',
    biweek: '第○ ×曜日',
    month: '毎月',
    evweek: '隔週'
}

const WeekdayType =  {
    0: '日曜日',
    1: '月曜日',
    2: '火曜日',
    3: '水曜日',
    4: '木曜日',
    5: '金曜日',
    6: '土曜日'
}


class TrashSchedule extends React.Component {
    createTrashSchedule(trash_index,schedule_index) {
        return( <div className={this.props.classes.TrashScheduleDiv}>
                    {this.createSchedule(trash_index,schedule_index)}
                    {this.createScheduleOption(trash_index,schedule_index)}
                </div>
            );
    }

    createSchedule(trash_index,schedule_index) {
        let target_schedule = this.props.trashes[trash_index].schedules[schedule_index]
        let scheduleOptionTag = []
        let option
        for(var key in ScheduleType) {
            scheduleOptionTag.push(<MenuItem value={key}>{ScheduleType[key]}</MenuItem>)
        }
        return (
                    <FormControl className={this.props.classes.ScheduleTypeFormControl}>
                        <InputLabel htmlFor={`schedule-${trash_index}-${schedule_index}`} style={{top: "-5"}}>
                            <Chip
                                avatar={<CalendarToday fontSize="small" style={{marginLeft: "8px",background:"none",width: "20px"}} />}
                                label={"スケジュール"+(schedule_index+1)}
                                color="primary"
                                style={{height: "25px"}}
                            />
                        </InputLabel>
                        <Select
                            id={`schedule-${trash_index}-${schedule_index}`}
                            name={`schedule-${trash_index}-${schedule_index}`}
                            value={target_schedule.type}
                            onChange={(e,children)=>this.props.onChangeSchedule(trash_index,schedule_index,e.target.value)}
                            style={{textAlign:"center"}}
                        >
                            {scheduleOptionTag}
                        </Select>
                        <FormHelperText></FormHelperText>
                    </FormControl>
        )
    }

    createScheduleOption(trash_index,schedule_index) {
        let target_schedule = this.props.trashes[trash_index].schedules[schedule_index]
        let inputTag
        switch(target_schedule.type) {
            case 'weekday':
                let weekdayOption=[]
                for(var key in WeekdayType) {
                    weekdayOption.push(<MenuItem value={key}>{WeekdayType[key]}</MenuItem>)
                }

                inputTag = <FormControl className={this.props.classes.OptionWeekFormControl}>
                            <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>曜日</InputLabel>
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
                break
            case 'biweek':
                let biweekOption = []
                for(var key in WeekdayType) {
                    for(var num=1; num<=5; num++) {
                        biweekOption.push(<MenuItem value={key+"-"+num}>{'第'+num+WeekdayType[key]}</MenuItem>)
                    }
                }
                inputTag = <FormControl className={this.props.classes.OptionWeekFormControl}>
                                <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>曜日</InputLabel>
                                <Select
                                    id={`scinput-${trash_index}-${schedule_index}`}
                                    name={`scinput-${trash_index}-${schedule_index}`}
                                    value={target_schedule.value}
                                    onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,e.target.value)}
                                    className={this.props.classes.OptionWeekSelect}
                                >
                                        {biweekOption}
                                </Select>
                                <FormHelperText error={target_schedule.error}>{target_schedule.error}</FormHelperText>
                            </FormControl>
                break
            case 'month':
                inputTag = <FormControl className={this.props.classes.OptionMonthFormControl}>
                                <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>日にち</InputLabel>
                                <Input
                                    id={`scinput-${trash_index}-${schedule_index}`}
                                    name={`scinput-${trash_index}-${schedule_index}`}
                                    type="number"
                                    placeholder='1～31の数字を入力'
                                    required={true}
                                    value={target_schedule.value}
                                    onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,e.target.value)}
                                    endAdornment={<InputAdornment position="end">日</InputAdornment>}
                                    inputProps={{style:{textAlign:"center"}}}
                                />
                                <FormHelperText error={target_schedule.error}>{target_schedule.error}</FormHelperText>
                            </FormControl>
                break
            case 'evweek':
                let evweekOption = []
                for(var key in WeekdayType) {
                    evweekOption.push(<MenuItem value={key}>{WeekdayType[key]}</MenuItem>)
                }

                inputTag =  <div className={this.props.classes.OptionEvWeekDiv}>
                                <FormControl className={this.props.classes.OptionEvweekFormControl}>
                                    <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>曜日</InputLabel>
                                    <Select
                                        id={`scinput-${trash_index}-${schedule_index}`}
                                        name={`scinput-${trash_index}-${schedule_index}`}
                                        value={target_schedule.value.weekday}
                                        onChange={(e)=>this.props.onChangeInput(trash_index,schedule_index,{weekday:e.target.value,start:target_schedule.value.start})}
                                    >
                                        {evweekOption}
                                    </Select>
                                </FormControl>
                                <div style={{display:"inline-flex",flexDirection:"column",alignItems:"start"}}>
                                    <FormHelperText style={{margin: "0 0 8px 0"}}>直近の収集日は？(日曜始まり)</FormHelperText>
                                    <ToggleButtonGroup
                                            value={target_schedule.value.start}
                                            exclusive
                                            onChange={(e,changed_value)=>{
                                                if(changed_value) {
                                                    this.props.onChangeInput(trash_index,schedule_index,{weekday:target_schedule.value.weekday,start:changed_value});
                                                }
                                            }}
                                            style={{flexDirection:"column",alignItems:"start"}}
                                    >
                                        <StyleToggleButton value="thisweek">今週</StyleToggleButton>
                                        <StyleToggleButton value="nextweek">来週</StyleToggleButton>
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
        )
    }
    createScheduleTags(trash_index) {
        const scheduleTags = []
        for(let i=0; i<3; i++){
            scheduleTags.push(
                 <Hidden><Grid item sm={5} /></Hidden>
             );
             scheduleTags.push(
                 <Grid item sm={7} xs={12}>
                   {this.createTrashSchedule(trash_index,i)}
                 </Grid>
             )
         }
         return scheduleTags
    }

    render(props) {
        let trashTag = []
        for(let i=0; i < this.props.trashes.length; i++) {
            let trashOptionTag = []
            for(var key in TrashType) {
                trashOptionTag.push(<MenuItem value={key}>{TrashType[key]}</MenuItem>)
            }

               const trashTypeTag = <div style={{display: "inlin-block"}}>
                        <FormControl className={this.props.classes.TrashTypeFormControl}>
                           <InputLabel htmlFor={`trash${i}`} style={{top: "-5"}}>
                                <Chip
                                    avatar={<Delete fontSize="small" style={{marginLeft: "8px",background:"none",width: "20px"}} />}
                                    label={"ゴミの種類"+(i+1)}
                                    color="secondary"
                                    style={{height: "25px"}}
                                />
                           </InputLabel>
                           <Select
                               id={`trash${i}`}
                               name={`trash${i}`}
                               value={this.props.trashes[i].type}
                               onChange={(e)=>{this.props.onChangeTrash(i,e.target.value)}}
                               style={{textAlign:"center"}}
                               >
                                   {trashOptionTag}
                           </Select>
                           <FormHelperText error={this.props.trashes[i].trash_type_error}>{this.props.trashes[i].trash_type_error}</FormHelperText>
                       </FormControl>
                       {this.props.trashes[i].type==='other' && (
                           <FormControl className={this.props.classes.OtherTrashInputFormControl}>
                               <InputLabel htmlFor={`othertrashtype${i}`}>任意のゴミを入力</InputLabel>
                                   <Input
                                       id={`othertrashtype${i}`}
                                       name={`othertrashtype${i}`}
                                       placeholder='任意のゴミを入力'
                                       required={true}
                                       inputProps={{maxLength:"10"}}
                                       value={this.props.trashes[i].trash_val}
                                       onChange={(e)=>{this.props.onInputTrashType(i,e.target.value)}}
                                       style={{textAlign:"center"}}
                                   />
                                   <FormHelperText error={this.props.trashes[i].input_trash_type_error}>{this.props.trashes[i].input_trash_type_error}</FormHelperText>
                           </FormControl>
                       )}
                       </div>


               trashTag.push(
                   <Grid container justify="center" spacing={24} style={{"margin-bottom":"10px"}}>
                        <Hidden xsDown>
                            <Grid sm={5} style={{display: "inline-flex",flexDirection: "row-reverse",alignItems: "center"}}>
                                <Button color="secondary" onClick={()=>this.props.onClick(i)}>削除</Button>
                            </Grid>
                        </Hidden>
                        <Grid item sm={7} xs={12}>
                            {trashTypeTag}
                        </Grid>
                        {this.createScheduleTags(i)}
                         <Hidden smUp>
                             <Grid item sm={12} xs={12} style={{textAlign: "center"}}>
                                <Button color="secondary" onClick={()=>this.props.onClick(i)}>削除</Button>
                             </Grid>
                         </Hidden>
                         <Grid item sm={8} xs={12} style={{"border-bottom":"1px solid #E91E63"}}/>
                   </Grid>
               );
        }
        return(
            trashTag
        )
    }
}

export default withStyles(AppStyle)(TrashSchedule);
