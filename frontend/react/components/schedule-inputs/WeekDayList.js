import React from 'react';
import { MenuItem } from '@material-ui/core';

const WeekdayType =  ['0','1','2','3','4','5','6'];
export function WeekDayList(props) {
    let WeekDayList = [];
    WeekdayType.map((key) => {
        WeekDayList.push(
            <MenuItem key={key} value={key}>
                {props.t('TrashSchedule.select.weekday.option.' + key)}
            </MenuItem>
        );
    });
    return WeekDayList;
}

export function BiWeekList(props) {
    let BiWeekList = [];
    WeekdayType.forEach((key) => {
        for (let num = 1; num <= 5; num++) {
            BiWeekList.push(
                <MenuItem key={key + '-' + num} value={key + '-' + num}>
                    {props.t('TrashSchedule.select.weekday.number.' + num) + props.t('TrashSchedule.select.weekday.option.' + key)}
                </MenuItem>
            );
        }
    });
    return BiWeekList;
}