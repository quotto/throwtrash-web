import React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import { Menu, MenuItem, Divider } from '@mui/material';
import { AppBarProps } from '../types/props';
import i18next from 'i18next';
import { signOut as signOutApi } from '../lib/api-client';

interface Props extends AppBarProps,WithTranslation{}
class BarMenu extends React.Component<Props,{}> {
    constructor(props: Props){
        super(props);
        this.openWindow = this.openWindow.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        signOutApi()
            .then(()=>{
                this.props.onSignOut();
            })
            .catch((e)=>console.error(e));
    }

    openWindow(url: string) {
        window.open(url);
        this.props.onChangeMenu(false, null);
    }

    render() {
        let LogOutDivider = <div style={{display: 'none'}}/>;
        let LogOutMenu = <div style={{display: 'none'}}/>;
        let UserName = <div style={{display: 'none'}}/>;
        let UserNameDivider = <div style={{display: 'none'}}/>;
        if(this.props.signedIn && this.props.userInfo) {
            UserName = <MenuItem>{this.props.t('BarMenu.loginas').replace('%s',this.props.userInfo.name)}</MenuItem>;
            UserNameDivider = <Divider />;
            LogOutDivider = <Divider />;
            LogOutMenu = <MenuItem onClick={this.signOut}> {this.props.t('BarMenu.logout')} </MenuItem>;
        }
        const manual_html = `./manual-${i18next.language}.html`;
        const policy_html = `./policy-${i18next.language}.html`;
        return (
            <Menu
                id="menu"
                anchorEl={this.props.menu.anchorEl}
                open={this.props.menu.open}
                onClose={() => this.props.onChangeMenu(false, null)} >
                {UserName}
                {UserNameDivider}
                <MenuItem onClick={()=>this.openWindow(manual_html)}>
                    {this.props.t('BarMenu.usage')}
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow(policy_html)}>
                    {this.props.t('BarMenu.policy')}
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow('https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true')}>
                    {this.props.t('BarMenu.contact')}
                </MenuItem>
                {LogOutDivider}
                {LogOutMenu}
            </Menu>
        );
    }
}

export default withTranslation()(BarMenu);
