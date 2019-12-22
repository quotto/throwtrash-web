import {connect} from 'react-redux';
import Main from '../components/Main';
import {
    changeSchedule,
    addTrash,
    deleteTrash,
    changeTrashType,
    inputTrashType,
    changeInput,
    errorDialog,
    setSubmitting
} from '../actions';

const mapPropsState = (state) => {
    return {
        trashes: state.updateState.trashes,
        submit_error: state.updateState.error,
        showErrorDialog: state.SubmitState.showErrorDialog,
        submitting: state.SubmitState.submitting
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeTrash: (i,value) => {
            dispatch(changeTrashType(i,value));
        },
        onChangeSchedule: (i,j,value) => {
            dispatch(changeSchedule(i,j,value));
        },
        onChangeInput: (i,j,value) => {
            dispatch(changeInput(i,j,value));
        },
        onInputTrashType: (i,value,maxlength) => {
            dispatch(inputTrashType(i,value,maxlength));
        },
        onClickAdd: () => {
            dispatch(addTrash());
        },
        onClickDelete: (i) =>{
            dispatch(deleteTrash(i));
        },
        onError: (open)=> {
            dispatch(errorDialog(open));
        },
        onSubmit: (status)=>{
            dispatch(setSubmitting(status));
        }
    };
};

const MainContainer = connect(
    mapPropsState,
    mapDispatchToProps
)(Main);

export default MainContainer;
