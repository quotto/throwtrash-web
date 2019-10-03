import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SignInDialog from './SignInDialog';
import BarMenu from './BarMenu';

const styles = (theme)=>({
    root: {
        flexGrow: 1,
    },
    appBarTitle: {
        flexGrow: 1,
        color: '#ffffff',
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%'
        }
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    }
});


class TopAppBar extends React.Component {
    render(){
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton 
                            edge="start" 
                            className={classes.menuButton} 
                            color="inherit" 
                            aria-label="menu" 
                            arial-control="menu" 
                            onClick={(event)=>this.props.onChangeMenu(true,event.target)}>
                            <MenuIcon />
                        </IconButton>
                        <BarMenu {...this.props} />
                        <Typography variant="h6" className={classes.appBarTitle}>
                            今日のゴミ出し
                        </Typography>
                        <SignInDialog {...this.props} />
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

TopAppBar.propTypes = {
    classes: PropTypes.object,
    onChangeMenu: PropTypes.func
};
export default withStyles(styles)(TopAppBar);