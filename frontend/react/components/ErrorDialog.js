import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import { DialogTitle, withStyles, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';

const style = {
    
};

class ErrorDialog extends React.Component {
    render() {
        const errorMessage = this.props.t('ErrorDialog.message').replace('%s',`<a href="https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true">${this.props.t('ErrorDialog.formname')}</a>`);
        return (
            <Dialog
                open={this.props.showErrorDialog}>
                <DialogTitle arial-labelledby='error-dialog-title'>エラーが発生しました</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {errorMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.props.onError(false)}>
                        {this.props.t('ErrorDialog.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

    }
}

ErrorDialog.propTypes = {
    showErrorDialog: PropTypes.bool,
    onError: PropTypes.func,
    t: PropTypes.func
};
export default withTranslation()(withStyles(style)(ErrorDialog));