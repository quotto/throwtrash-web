import React from 'react'
import {
    Select,
    MenuItem,
    Input,
    InputLabel,
    InputAdornment,
    Button,
    FormHelperText,
    FormControl,
    Grid
} from 'material-ui'
import { withStyles } from 'material-ui/styles';
import { AppStyle } from './style'

const TrashType = {
    burn : 'もえるゴミ',
    unburn: 'もえないゴミ',
    plastic: 'プラスチック',
    bottole: 'ビン・カン',
    petbottle: 'ペットボトル',
    paper: '古紙',
    resource: '資源ごみ',
    coarse: '粗大ごみ'
}

const ScheduleType = {
    none: undefined,
    weekday: '毎週',
    biweek: '隔週',
    month: '毎月'
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

const required = (value) => {
    console.log("required:"+value)
    return value ? undefined : 'Required'
}

const number = value => {return value && isNaN(Number(value)) ? 'Must be a number' : undefined}
const minValue = (min,value) => {
  return value && value < min ? `${min}以上の数字を入力してください` : undefined
}

const maxValue = (max,value) => {
    return value && value > max ? `${max}以下の数字を入力してください` : undefined
}

class TrashSchedule extends React.Component {
    render(props) {
        let trashTag = []
        for(let i=0; i < this.props.trashes.length; i++) {
            let trashOptionTag = []
            for(var key in TrashType) {
                trashOptionTag.push(<MenuItem value={key}>{TrashType[key]}</MenuItem>)
            }

            let scheduleTag = []
            for(let j=0; j<this.props.trashes[i].schedules.length; j++) {
                let target_schedule = this.props.trashes[i].schedules[j]
                let scheduleOptionTag = []
                let option
                for(var key in ScheduleType) {
                    scheduleOptionTag.push(<MenuItem value={key}>{ScheduleType[key]}</MenuItem>)
                }
                let inputTag
                switch(target_schedule.type) {
                    case 'weekday':
                        let weekdayOption=[]
                        for(var key in WeekdayType) {
                            weekdayOption.push(<MenuItem value={key}>{WeekdayType[key]}</MenuItem>)
                        }

                        inputTag = <FormControl style={{"display":"inline-block","vertical-align":"top","width":"40%"}}>
                                    <InputLabel htmlFor={`scinput-${i}-${j}`}>曜日</InputLabel>
                                    <Select
                                        id={`scinput-${i}-${j}`}
                                        name={`scinput-${i}-${j}`}
                                        value={target_schedule.value}
                                        onChange={(e)=>this.props.onChangeInput(i,j,e.target.value)}
                                        style={{"width":"100%","text-align":"center"}}
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
                        inputTag = <FormControl style={{"display":"inline-block","vertical-align":"top","width":"40%"}}>
                                        <InputLabel htmlFor={`scinput-${i}-${j}`}>曜日</InputLabel>
                                        <Select
                                            id={`scinput-${i}-${j}`}
                                            name={`scinput-${i}-${j}`}
                                            value={target_schedule.value}
                                            onChange={(e)=>this.props.onChangeInput(i,j,e.target.value)}
                                            style={{"width":"100%","text-align":"center"}}>
                                                {biweekOption}
                                        </Select>
                                        <FormHelperText error={target_schedule.error}>{target_schedule.error}</FormHelperText>
                                    </FormControl>
                        break
                    case 'month':
                        inputTag = <FormControl style={{"display":"inline-block","vertical-align":"top","text-align":"center","width":"40%"}}>
                                        <InputLabel htmlFor={`scinput-${i}-${j}`}>日にち</InputLabel>
                                        <Input
                                            id={`scinput-${i}-${j}`}
                                            name={`scinput-${i}-${j}`}
                                            type="number"
                                            placeholder='1～31の数字を入力'
                                            required={true}
                                            value={target_schedule.value}
                                            onChange={(e)=>this.props.onChangeInput(i,j,e.target.value,[()=>required(e.target.value),()=>number(e.target.value),()=>minValue(1,e.target.value),()=>maxValue(31,e.target.value)])}
                                            endAdornment={<InputAdornment position="end">日</InputAdornment>}
                                            inputProps={{style:{"text-align":"center"}}}
                                        />
                                        <FormHelperText error={target_schedule.error}>{target_schedule.error}</FormHelperText>
                                    </FormControl>
                        break
                    default:
                        break
                }
                scheduleTag.push(
                    <Grid item sm={5} xs={12} className={`${this.props.classes.xsTextCenter} ${this.props.classes.smTextLeft}`}>
                        <FormControl style={{"margin-right":"10px","width":"40%","vertical-align":"top","text-align":"center"}}>
                            <InputLabel htmlFor={`schedule-${i}-${j}`}>スケジュール{j+1}</InputLabel>
                            <Select
                                id={`schedule-${i}-${j}`}
                                name={`schedule-${i}-${j}`}
                                value={target_schedule.type}
                                onChange={(e,children)=>this.props.onChangeSchedule(i,j,e.target.value)}
                                style={{"text-align":"center"}}>
                                    {scheduleOptionTag}
                            </Select>
                            <FormHelperText></FormHelperText>
                        </FormControl>
                        {inputTag}
                    </Grid>
                )
            }

            trashTag.push(
                <Grid container justify="center" spacing={24} style={{"margin-bottom":"10px"}}>
                    <Grid item sm={5} xs={12} className={`${this.props.classes.xsTextCenter} ${this.props.classes.smTextRight}`}>
                            <Button className={`${this.props.classes.xsHidden}`} color="secondary" onClick={()=>this.props.onClick(i)}>削除</Button>
                            <FormControl style={{"width":"50%"}}>
                                <InputLabel htmlFor={`trash${i}`}>ゴミの種類{i+1}</InputLabel>
                                <Select
                                    id={`trash${i}`}
                                    name={`trash${i}`}
                                    value={this.props.trashes[i].type}
                                    onChange={(e)=>{console.log(e);this.props.onChangeTrash(i,e.target.value)}}
                                    style={{"text-align":"center"}}>
                                        {trashOptionTag}
                                </Select>
                                <FormHelperText error={this.props.trashes[i].error}>{this.props.trashes[i].error}</FormHelperText>
                            </FormControl>
                    </Grid>
                    {scheduleTag[0]}
                    <Grid item sm={2} className={this.props.classes.xsHidden}></Grid>

                    <Grid item sm={5} className={this.props.classes.xsHidden}></Grid>
                    {scheduleTag[1]}
                    <Grid item sm={2} className={this.props.classes.xsHidden}></Grid>

                    <Grid item sm={5} className={this.props.classes.xsHidden}></Grid>
                    {scheduleTag[2]}
                    <Grid item sm={2} className={this.props.classes.xsHidden}></Grid>
                    <Grid item xs={12} className={this.props.classes.smHidden}>
                        <Button color="secondary" onClick={()=>this.props.onClick(i)}>削除</Button>
                    </Grid>
                    <Grid item sm={8} xs={8} style={{"border-bottom":"1px solid #E91E63"}}/>
                </Grid>
            )
        }
        return(
            trashTag
        )
    }
}

export default withStyles(AppStyle)(TrashSchedule);
