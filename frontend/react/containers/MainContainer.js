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
    setSubmitting,
    addSchedule,
    deleteSchedule,
    setZipcodeMessage,
    changeZipcode,
    submitZipcode,
    changeZipcodeStatus,
    setErrorZipcode,
    setPreset,
    changePage,
    changePerPage
} from '../actions';

const mapPropsState = (state) => {
    return {
        trashes: state.updateState.trashes,
        submit_error: state.updateState.error,
        showErrorDialog: state.SubmitState.showErrorDialog,
        submitting: state.SubmitState.submitting,
        zipcodeState: state.zipCodeReducer
    };
};

const MainContainer = connect(
    mapPropsState,
    {
        onChangeTrash: changeTrashType,
        onChangeSchedule: changeSchedule,
        onChangeInput: changeInput,
        onInputTrashType: inputTrashType,
        onClickAdd: addTrash,
        onClickDelete: deleteTrash,
        onError: errorDialog,
        onSubmit: setSubmitting,
        addSchedule,
        deleteSchedule,
        setZipcodeMessage,
        changeZipcode,
        submitZipcode,
        changeZipcodeStatus,
        setErrorZipcode,
        setPreset,
        changePerPage,
        changePage
    }
)(Main);

export default MainContainer;
