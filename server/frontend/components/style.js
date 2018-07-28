export const AppStyle=theme=>({
    smTextLeft: {
        [theme.breakpoints.up('sm')] : {
            "text-align": "left"
        }
    },
    smTextRight: {
        [theme.breakpoints.up('sm')] : {
            "text-align": "right"
        }
    },
    xsTextCenter: {
        [theme.breakpoints.down('sm')] : {
            "text-align": "center"
        }
    },
    xsHidden: {
        [theme.breakpoints.down('sm')] : {
            display: "none"
        },
        [theme.breakpoints.up('sm')] : {
            display: "inline-block"
        }
    },
    smHidden: {
        [theme.breakpoints.down('sm')] : {
            display: "display",
            "text-align": "center"
        },
        [theme.breakpoints.up('sm')] : {
            display: "none"
        }
    },
    trashTypeInput: {
        "width": "50%"
    },
    scheduleTypeInput: {
        "margin-right":"10px",
        "width":"40%",
        "vertical-align":"top",
        "text-align":"center"
    },
    scheduleTypeMonth: {
        "display":"inline-block",
        "vertical-align":"top",
        "text-align":"center",
        "width":"40%"
    },
    scheduleTypeWeek: {
        "display":"inline-block",
        "vertical-align":"top",
        "width":"40%"
    },
    scheduleWeekSelect: {
        "width":"100%",
        "text-align":"center"
    },
    scheduleTypeSelect: {
        "text-align": "center"
    },
    component: {
        width: "90%",
        margin: "0 auto"
    }
})
