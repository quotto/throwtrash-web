import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Grid,
    Hidden,
} from '@material-ui/core';
import TrashType from './TrashType';

import {withTranslation} from 'react-i18next';
import Schedules from './Schedules';

class TrashSchedule extends React.Component {
    render() {
        let trashTag = [];
        for(let i=0; i < this.props.trashes.length; i++) {
            trashTag.push(
                <Grid container justify='center' spacing={24} style={{marginBottom:'10px'}} key={`trash${i}`}>
                    <Hidden xsDown>
                        <Grid item sm={5} style={{display: 'inline-flex',flexDirection: 'row-reverse',alignItems: 'center'}}>
                            <Button color='secondary' onClick={()=>this.props.onClick(i)}>{this.props.t('TrashSchedule.button.delete')}</Button>
                        </Grid>
                    </Hidden>
                    <Hidden smUp>
                        <Grid item xs={1} />
                    </Hidden>
                    <Grid item sm={7} xs={10}>
                        <TrashType
                            number={i}
                            trash={this.props.trashes[i]}
                            onChangeTrash={this.props.onChangeTrash}
                            onInputTrashType={this.props.onInputTrashType}
                        />
                    </Grid>
                    <Hidden smUp>
                        <Grid item xs={1} />
                    </Hidden>
                    <Schedules
                        trash={this.props.trashes[i]}
                        trash_index={i}
                        onChangeInput={this.props.onChangeInput}
                        onChangeSchedule={this.props.onChangeSchedule}
                    />
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
    trashes: PropTypes.array,
    onChangeSchedule: PropTypes.func,
    onChangeTrash: PropTypes.func,
    onChangeInput: PropTypes.func,
    onClickDelete: PropTypes.func,
    onInputTrashType: PropTypes.func,
    onClickAdd: PropTypes.func,
    onClick: PropTypes.func,
    onSubmit: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(TrashSchedule);
