import React from 'react'
import ScheduleListContainer from '../containers/ScheduleListContainer'
import {Field, Form,reduxForm} from 'redux-form'

const  SubmitForm = ()=>{
    return (
        <form name="registform">
            <ScheduleListContainer />
        </form>
    )
}
export default SubmitForm
