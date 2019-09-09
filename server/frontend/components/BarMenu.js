import Axios from 'axios';
import React from 'react';
import { Menu, MenuItem, Hidden, withStyles, Divider } from '@material-ui/core';

class BarMenu extends React.Component {
    signOut() {
        console.log('signout');
        Axios.get('/signout')
            .then(response=>{
                console.log(response);
                this.props.onSignOut();
            }).catch(err=>{
                console.log(err);
            });
    }

    render() {
        let LogOutDivider = <div style={{display: 'none'}}/>;
        let LogOutMenu = <div style={{display: 'none'}}/>;
        if(this.props.signedIn) {
            LogOutDivider = <Divider />
            LogOutMenu = <MenuItem onClick={()=>this.signOut(this.props)}> ログアウト </MenuItem>
        }
        return (
            <Menu
                id="menu"
                anchorEl={this.props.menu.anchorEl}
                open={this.props.menu.open}
                onClose={() => this.props.onChangeMenu(false, null)} >
                <MenuItem>
                    使い方
                </MenuItem>
                <MenuItem>
                    プライバシーポリシー
                </MenuItem>
                <MenuItem>
                    お問合せ
                </MenuItem>
                {LogOutDivider}
                {LogOutMenu}
            </Menu>
        );
    }
}

export default BarMenu;