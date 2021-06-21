import {ActionType} from '../actions';
import _ from 'lodash';

const MenuReducer = (state={menuOpen: false, anchorEl: null, openContact:false},action)=>{
    const new_state = _.cloneDeep(state);
    switch(action.type) {
    case ActionType.MENU_CHANGE:
        new_state.menuOpen = action.open;
        new_state.anchorEl = action.anchorEl;
        break;
    case ActionType.SIGN_OUT:
        new_state.menuOpen = false;
        new_state.anchorEl = null;
        break;
    default:
        break;
    }
    return new_state;
};

export default MenuReducer;