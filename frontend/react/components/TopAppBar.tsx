import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/material/Menu';
import { Theme } from '@mui/material';
import { withStyles, WithStyles, StyleRules, createStyles } from '@mui/styles';
import { WithTranslation, withTranslation } from 'react-i18next';
import SignInDialog from './SignInDialog';
import NotificationDialog from './NotificationDialog';
import BarMenu from './BarMenu';
import { AppBarProps } from '../containers/AppBarContainer';

const styles = (theme: Theme): StyleRules=>createStyles({
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


interface Props extends AppBarProps,WithStyles<typeof styles>,WithTranslation{}
class TopAppBar extends React.Component<Props, {}> {
    render(){
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            data-title={this.props.t('IntroJS.other.title')}
                            data-intro={this.props.t('IntroJS.other.hint')}
                            data-step={4}
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            arial-control="menu"
                            onClick={(event)=>this.props.onChangeMenu(true,event.target as Element)}>
                        </IconButton>
                        <BarMenu {...this.props} />
                        <Typography variant="h6" className={classes.appBarTitle}>
                            {this.props.t('TopAppBar.title')}
                        </Typography>
                        <NotificationDialog {...this.props} />
                        <SignInDialog {...this.props} />
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withTranslation()(withStyles(styles)(TopAppBar));