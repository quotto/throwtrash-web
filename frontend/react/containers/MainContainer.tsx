import {connect, ConnectedProps} from 'react-redux';
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
    changePerPage,
    changeNextdayCheck
} from '../actions';
import { TrashReducerState } from '../reducers/TrashReducer';
import { SubmitReducerState } from '../reducers/SubmitReducer';
import { ZipcodeReducerState } from '../reducers/ZipcodeReducer';
import { NextdayCheckReducerState } from '../reducers/NextdayCheckReducer';
import Main from '../components/Main';

interface MainState {
    updateState: TrashReducerState,
    SubmitState: SubmitReducerState,
    zipCodeReducer: ZipcodeReducerState,
    nextdayCheckReducer: NextdayCheckReducerState
}

const mapPropsState = (state: MainState) => {
    return {
        trashes: state.updateState.trashes,
        submit_error: state.updateState.error,
        showErrorDialog: state.SubmitState.showErrorDialog,
        submitting: state.SubmitState.submitting,
        zipcodeState: state.zipCodeReducer,
        nextday_checked: state.nextdayCheckReducer.checked
    };
};

const connector = connect(
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
        changePage,
        onChangeNextdayCheck: changeNextdayCheck
    }
);

export type MainProps = ConnectedProps<typeof connector>

export default connector(Main);
