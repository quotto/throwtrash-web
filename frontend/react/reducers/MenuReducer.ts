import { ACTION_TYPE, MenuReducerAction } from '../actions';
import _ from 'lodash';

export interface MenuReducerState {
    menuOpen: boolean,
    anchorEl: Element | null,
    openContact: boolean
}
const MenuReducer = (state: MenuReducerState={menuOpen: false, anchorEl: null, openContact:false},action: MenuReducerAction)=>{
    const new_state = _.cloneDeep(state);
    switch(action.type) {
    case ACTION_TYPE.MENU_CHANGE:
        new_state.menuOpen = action.open;
        new_state.anchorEl = action.anchorEl;
        break;
    case ACTION_TYPE.SIGN_OUT:
        new_state.menuOpen = false;
        break;
    default:
        break;
    }
    return new_state;
};

export default MenuReducer;