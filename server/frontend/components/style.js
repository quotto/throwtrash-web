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
    component: {
        width: "90%",
        margin: "0 auto"
    }
})
