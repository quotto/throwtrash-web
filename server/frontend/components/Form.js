import React from 'react';
import ScheduleListContainer from '../containers/ScheduleListContainer';

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
