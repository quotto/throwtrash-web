import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Theme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { withStyles, WithStyles, StyleRules, createStyles } from '@mui/styles';
import SignInDialog from './SignInDialog';
import NotificationDialog from './NotificationDialog';
import BarMenu from './BarMenu';
import { AppBarProps } from '../types/props';

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
        const {classes, t, ...rest} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            data-title={t('IntroJS.other.title')}
                            data-intro={t('IntroJS.other.hint')}
                            data-step={4}
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            arial-control="menu"
                            onClick={(event)=>rest.onChangeMenu(true,event.target as Element)}>
                                <MenuIcon />
                        </IconButton>
                        <BarMenu {...rest} />
                        <Typography variant="h6" className={classes.appBarTitle}>
                            {t('TopAppBar.title')}
                        </Typography>
                        <NotificationDialog {...rest} />
                        <SignInDialog {...rest} />
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withTranslation()(withStyles(styles)(TopAppBar));
