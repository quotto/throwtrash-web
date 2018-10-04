import React from 'react';
import ScheduleListContainer from '../containers/ScheduleListContainer';
import {Field, Form,reduxForm} from 'redux-form'

class  SubmitForm extends React.Component {
    render() {
        return (
            <form name="registform">
                <ScheduleListContainer />
            </form>
        );
    }
}
export default SubmitForm;
