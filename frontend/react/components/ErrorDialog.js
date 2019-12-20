import React from 'react';
import PropTypes from 'prop-types';
import { DialogTitle, withStyles, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';

const style = {
    
};

class ErrorDialog extends React.Component {
    render() {
        return (
            <Dialog
                open={this.props.showErrorDialog}>
                <DialogTitle arial-labelledby='error-dialog-title'>エラーが発生しました</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        お手数ですが<a href='https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true'>お問い合わせフォーム</a>よりエラーの発生状況をご連絡願います。

                        開発者にて確認次第対応いたします。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.props.onError(false)}>
                        閉じる
                    </Button>
                </DialogActions>
            </Dialog>
        );

    }
}

ErrorDialog.propTypes = {
    showErrorDialog: PropTypes.bool,
    onError: PropTypes.func
};
export default withStyles(style)(ErrorDialog);