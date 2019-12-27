import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import { Menu, MenuItem, Divider } from '@material-ui/core';

class BarMenu extends React.Component {
    constructor(props){
        super(props);
        this.openWindoww = this.openWindow.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        axios.get(`https://backend.mythrowaway.net/${API_STAGE}/signout`,{withCredentials: true})
            .then(()=>{
                this.props.onSignOut();
            });
    }

    openWindow(url) {
        window.open(url);
        this.props.onChangeMenu(false, null);
    }

    render() {
        let LogOutDivider = <div style={{display: 'none'}}/>;
        let LogOutMenu = <div style={{display: 'none'}}/>;
        let UserName = <div style={{display: 'none'}}/>;
        let UserNameDivider = <div style={{display: 'none'}}/>;
        if(this.props.signedIn) {
            UserName = <MenuItem>{this.props.t('BarMenu.loginas').replace('%s',this.props.userInfo.name)}</MenuItem>;
            UserNameDivider = <Divider />;
            LogOutDivider = <Divider />;
            LogOutMenu = <MenuItem onClick={this.signOut}> {this.props.t('BarMenu.logout')} </MenuItem>;
        }
        const manual_html = `/manual-${this.props.i18n.language}.html`;
        const policy_html = `/policy-${this.props.i18n.language}.html`;
        return (
            <Menu
                id="menu"
                anchorEl={this.props.menu.anchorEl}
                open={this.props.menu.open}
                onClose={() => this.props.onChangeMenu(false, null)} >
                {UserName}
                {UserNameDivider} 
                <MenuItem onClick={()=>this.openWindow(manual_html)}>
                    {this.props.t("BarMenu.usage")}
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow(policy_html)}>
                    {this.props.t("BarMenu.policy")}
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow('https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true')}>
                    {this.props.t("BarMenu.contact")}
                </MenuItem>
                {LogOutDivider}
                {LogOutMenu}
            </Menu>
        );
    }
}

BarMenu.propTypes = {
    signedIn: PropTypes.bool,
    userInfo: PropTypes.object,
    menu: PropTypes.object,
    onChangeMenu: PropTypes.func,
    onSignOut: PropTypes.func,
    t: PropTypes.func,
    i18n: PropTypes.object
};

export default withTranslation()(BarMenu);