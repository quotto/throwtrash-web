import {connect} from 'react-redux'
import ScheduleList from '../components/ScheduleList'
import {
    changeSchedule,
    addTrash,
    deleteTrash,
    changeTrashType,
    changeInput,
    setSubmitting,
    submitForm
} from '../actions'

const asynchSubmit = ()=>{

}

const mapPropsState = (state) => {
    console.log("change props")
    return {
        trashes: state.updateState.trashes,
        submit_error: state.updateState.error,
        submitting: state.updateState.submitting
    }
}

const mapDispatchToProps = (dispatch) => {
    console.log("dispath")
    return {
        onChangeTrash: (i,value) => {
            dispatch(changeTrashType(i,value))
        },
        onChangeSchedule: (i,j,value) => {
            dispatch(changeSchedule(i,j,value))
        },
        onChangeInput: (i,j,value,validate=[]) => {
            dispatch(changeInput(i,j,value,validate))
        },
        onClickAdd: () => {
            dispatch(addTrash())
        },
        onClickDelete: (i) =>{
            dispatch(deleteTrash(i))
        },
        onSubmit: (status)=>{
            dispatch(setSubmitting(status))
        }
    }
}

const ScheduleListContainer = connect(
    mapPropsState,
    mapDispatchToProps
)(ScheduleList)

export default ScheduleListContainer
