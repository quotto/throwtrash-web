import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Grid,
    Hidden,
    withStyles
} from '@material-ui/core';
import TrashType from './TrashType';

import {withTranslation} from 'react-i18next';
import Schedules from './Schedules';
import {Link} from 'react-router-dom';
import {Delete, NotInterested, CalendarToday} from '@material-ui/icons';

const styles = (theme)=>({
    TrashScheduleContainer: {
        marginBottom: '10px',
    },
    TrashTypeContainer: {
        marginBottom: '10px'
    },
    ExcludeButton: {
        color: theme.palette.success.main,
        backgroundColor: 'white',
        borderColor: theme.palette.success.main,
        '&:hover': {
            backgroundColor: '#e8f5e9',
            borderColor: theme.palette.success.main,
            boxShadow: 'none',
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: theme.palette.success.light,
            borderColor: '#005cbf',
        },
        '&:focus': {
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
        },
    },
    TrashScheduleUnderButtons: {
        textAlign: 'cennter',
        '& button': {
            margin: '5px',
        }
    }
});
class TrashSchedule extends React.Component {
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
                                onChangeTrash={this.props.onChangeTrash}
                                onInputTrashType={this.props.onInputTrashType}
                            />
                            <Schedules
                                trash={trashes[i]}
                                trash_index={i}
                                onChangeInput={this.props.onChangeInput}
                                onChangeSchedule={this.props.onChangeSchedule}
                                deleteSchedule={this.props.deleteSchedule}
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
                                    className={classes.ExcludeButton}
                                    variant='outlined'
                                    color='success.main'
                                    startIcon={<NotInterested />}>
                                    {this.props.t('TrashSchedule.button.exclude')}
                                </Button>
                            </Link>
                            <Button
                                variant='outlined'
                                color='secondary'
                                startIcon={<Delete />}
                                onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
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

TrashSchedule.propTypes = {
    trashes: PropTypes.array,
    onChangeSchedule: PropTypes.func,
    onChangeTrash: PropTypes.func,
    onChangeInput: PropTypes.func,
    onClickDelete: PropTypes.func,
    onInputTrashType: PropTypes.func,
    onClickAdd: PropTypes.func,
    onClick: PropTypes.func,
    onSubmit: PropTypes.func,
    deleteSchedule: PropTypes.func,
    addSchedule: PropTypes.func,
    t: PropTypes.func,
    classes: PropTypes.object
};

export default withStyles(styles)(withTranslation()(TrashSchedule));
