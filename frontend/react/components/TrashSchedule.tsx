import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Grid,
    Hidden,
    Theme,
} from '@mui/material';
import TrashType from './TrashType';

import {WithTranslation, withTranslation} from 'react-i18next';
import Schedules from './Schedules';
import {Link} from 'react-router-dom';
import {Delete, NotInterested, CalendarToday} from '@mui/icons-material';
import { createStyles,WithStyles,withStyles,StyleRules } from '@mui/styles';
import { MainProps } from '../containers/MainContainer';

const styles = (theme: Theme): StyleRules=>createStyles({
    TrashScheduleContainer: {
        marginBottom: '10px',
    },
    TrashTypeContainer: {
        marginBottom: '10px'
    },
    ExcludeButton: {
        color: theme.palette.warning.main,
        backgroundColor: 'white',
        borderColor: theme.palette.warning.main,
        '&:hover': {
            backgroundColor: '#e8f5e9',
            borderColor: theme.palette.warning.main,
            boxShadow: 'none',
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: theme.palette.warning.light,
            borderColor: '#005cbf',
        },
        '&:focus': {
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
        },
    },
    TrashScheduleUnderButtons: {
        textAlign: 'center',
        '& button': {
            margin: '5px',
        }
    }
});

interface Props extends MainProps, WithStyles<typeof styles>,WithTranslation{}
class TrashSchedule extends React.Component<Props,{}> {
    render() {
        const {classes, trashes} = this.props;
        let trashTag = [];
        for(let i=0; i < trashes.length; i++) {
            trashTag.push(
                <Grid
                    className={classes.TrashScheduleContainer}
                    container>
                    <Hidden xsDown><Grid item sm={2} md={3} /></Hidden>
                    <Grid container
                        spacing={0}
                        style={{marginBottom:'10px'}}
                        key={`trash${i}`}
                        xs={12}
                        sm={8}
                        md={6}
                    >
                        <Grid container>
                            <TrashType
                                number={i}
                                trash={trashes[i]}
                                {...this.props}
                            />
                            <Schedules
                                trash={trashes[i]}
                                trash_index={i}
                                {...this.props}
                            />
                        </Grid>
                        <Grid
                            className={classes.TrashScheduleUnderButtons}
                            item container
                            sm={12} xs={12}
                        >
                            {trashes[i].schedules.length < 3 ? <Button
                                color='primary'
                                variant='outlined'
                                startIcon={<CalendarToday />}
                                onClick={()=>this.props.addSchedule(i)}
                            >
                                {this.props.t('TrashSchedule.button.add')}
                            </Button> : null}
                            <Link
                                to={`/exclude/${i}`}
                                style={{textDecoration: 'none'}}
                            >
                                <Button
                                    // className={classes.ExcludeButton}
                                    color='warning'
                                    variant='outlined'
                                    startIcon={<NotInterested />}>
                                    {this.props.t('TrashSchedule.button.exclude')}
                                </Button>
                            </Link>
                            <Button
                                variant='outlined'
                                color='error'
                                startIcon={<Delete />}
                                onClick={()=>this.props.onClickDelete(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Grid>
                    <Hidden xsDown><Grid item sm={2} md={3} /></Hidden>
                </Grid>
            );
        }
        return(
            trashTag
        );
    }
}

export default withStyles(styles)(withTranslation()(TrashSchedule));
