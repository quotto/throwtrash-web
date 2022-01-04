import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation, WithTranslation} from 'react-i18next';
import { DialogTitle, withStyles, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import {MainProps} from '../containers/MainContainer'

interface Props extends MainProps,WithTranslation{}

class ErrorDialog extends React.Component<Props,{}> {
    render() {
        const errorMessage = this.props.t('ErrorDialog.message').replace('%s',`<a href="https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true">${this.props.t('ErrorDialog.formname')}</a>`);
        return (
            <Dialog
                open={typeof(this.props.showErrorDialog) != 'undefined' ? this.props.showErrorDialog : false}>
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

export default withTranslation()(ErrorDialog);