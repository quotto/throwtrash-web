import {connect} from 'react-redux';
import ScheduleList from '../components/ScheduleList';
import {
    changeSchedule,
    addTrash,
    deleteTrash,
    changeTrashType,
    inputTrashType,
    changeInput,
    setSubmitting
} from '../actions';

const mapPropsState = (state) => {
    return {
        trashes: state.updateState.trashes,
        submit_error: state.updateState.error,
        submitting: state.updateState.submitting
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
        onSubmit: (status)=>{
            dispatch(setSubmitting(status));
        }
    };
};

const ScheduleListContainer = connect(
    mapPropsState,
    mapDispatchToProps
)(ScheduleList);

export default ScheduleListContainer;
