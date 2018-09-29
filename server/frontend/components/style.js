export const AppStyle=theme=>({
    ScheduleTypeFormControl: {
        "vertical-align":"top",
        "text-align":"center",
        [theme.breakpoints.up('sm')] : {
            "margin-right":"10px",
            "width":"40%",
            "min-width":"130px",
            "max-width":"210px"
        },
        [theme.breakpoints.down('xs')]: {
            "width":"100%"
        }
    },
    OptionMonthFormControl: {
        "display":"inline-block",
        "vertical-align":"top",
        [theme.breakpoints.up('sm')] : {
            "text-align":"center",
            "width":"40%",
            "min-width":"130px",
            "max-width":"210px"
        },
        [theme.breakpoints.down('xs')]: {
            "text-align":"left",
            "width":"50%"
        }
    },
    OptionWeekFormControl: {
        "display":"inline-block",
        "vertical-align":"top",
        [theme.breakpoints.up('sm')] : {
            "width":"40%",
            "min-width":"130px",
            "max-width":"210px"
        },
        [theme.breakpoints.down('xs')]: {
            "text-align":"left",
            "width":"50%"
        }
    },
    OptionWeekSelect: {
        "width":"100%",
        "text-align":"center"
    },
    OptionEvWeekDiv: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        [theme.breakpoints.down('xs')]: {
            flexDirection: "column"
        }
    },
    OptionEvweekFormControl: {
        textAlign:"center",
        width:"50%",
        marginRight: "10px",
        [theme.breakpoints.down('xs')]: {
            textAlign:"left",
            "width":"50%",
            "min-width":"none",
            "max-width":"none",
            "margin-bottom":"8px"
        }
    },
    OptionEvWeekSelect: {
        [theme.breakpoints.down('xs')]: {
            "width":"100%",
            "text-align":"center"
        }
    },
    component: {
        width: "90%",
        margin: "0 auto"
    },
    TrashTypeGrid: {
        "text-align":"left",
        [theme.breakpoints.down('xs')] : {
            TrashTypeGrid: {
                "text-align": "center"
            }
        }
    },
    TrashTypeFormControl: {
        [theme.breakpoints.up('sm')] : {
            "margin-right":"10px",
            "width": "40%",
            "min-width":"130px",
            "max-width":"210px",
        },
        [theme.breakpoints.down('xs')] : {
            "width": "100%",
        }
    },
    OtherTrashInputFormControl: {
        [theme.breakpoints.up('sm')] : {
            "margin-right":"10px",
            "width": "40%",
            "min-width":"130px",
            "max-width":"210px",
        },
        [theme.breakpoints.down('xs')] : {
            "width": "50%",
        }
    },
    TrashScheduleDiv: {
        display: "flex",
        [theme.breakpoints.up('sm')]: {
            flexDirection: "row",
            position: "relative",
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: "column"
        }
    }

})
