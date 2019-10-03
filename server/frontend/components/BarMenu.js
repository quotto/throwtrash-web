import Axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, Divider } from '@material-ui/core';

class BarMenu extends React.Component {
    constructor(props){
        super(props);
        this.openWindoww = this.openWindow.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        Axios.get('/signout')
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
            UserName = <MenuItem>{this.props.userInfo.name} さんとしてログインしています。</MenuItem>;
            UserNameDivider = <Divider />;
            LogOutDivider = <Divider />;
            LogOutMenu = <MenuItem onClick={this.signOut}> ログアウト </MenuItem>;
        }
        return (
            <Menu
                id="menu"
                anchorEl={this.props.menu.anchorEl}
                open={this.props.menu.open}
                onClose={() => this.props.onChangeMenu(false, null)} >
                {UserName}
                {UserNameDivider} 
                <MenuItem onClick={()=>this.openWindow('/manual.html')}>
                    使い方
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow('/policy.html')}>
                    プライバシーポリシー
                </MenuItem>
                <MenuItem onClick={()=>this.openWindow('https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true')}>
                    お問合せ
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
    onSignOut: PropTypes.func
};

export default BarMenu;