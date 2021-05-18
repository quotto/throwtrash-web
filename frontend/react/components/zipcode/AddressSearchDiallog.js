import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, withStyles } from '@material-ui/core';
import React from 'react';
import PropTypes from 'prop-types';
import { ZipcodeStatus } from '../../reducers/ZipcodeReducer';
import axios from 'axios';

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.secondary.light
        }
    },
}))(TableRow);

class AddressSearchDialog extends React.Component {
    render() {
        const { changeZipcodeStatus, submitZipcode, changePage, changePerPage } = this.props;
        const { status, address_page_state, submitting } = this.props.zipcodeState;
        const { current_page, per_page, address_list } = address_page_state;
        return (
            <Dialog
                open={status === ZipcodeStatus.AddressSelect}
            >
                <DialogTitle
                    id='result-dialog-title'>
                        検索結果
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        複数の住所が見つかりました。ひとつ選択してください。
                    </DialogContentText>
                    {submitting? <CircularProgress /> : 
                        <Paper>
                            <TableContainer component={Paper}>
                                <Table size='small' arial-label='trashes-table'>
                                    <TableBody>
                                        {address_list.slice(current_page * per_page, current_page + per_page).map((address,index)=>{
                                            return (<StyledTableRow 
                                                key={index}
                                                onClick={async(_)=>{
                                                    submitZipcode(true);
                                                    axios.get(`https://zipcode.mythrowaway.net/load?address=${address}`).then((response) => {
                                                        console.log(response.data);
                                                        // ページネーション表示
                                                        changeZipcodeStatus(ZipcodeStatus.ResultSelect, response.data);
                                                    }).catch(error => console.error(error))
                                                        .finally(() => submitZipcode(false));
                                                }}
                                            >
                                                <TableCell component='th' scope='row'>
                                                    {address}
                                                </TableCell>
                                            </StyledTableRow>);
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/* TODO: ページネーションロジック未実装 */ }
                            {address_page_state.address_list.length > 5 && <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={address_list.length}
                                rowsPerPage={per_page}
                                page={current_page}
                                labelRowsPerPage='1ページあたりの行数'
                                onChangePage={(e,new_page)=>changePage(new_page)}
                                onChangeRowsPerPage={(e)=>{
                                    changePerPage(e.target.value);
                                    changePage(0);
                                }}
                            />}
                        </Paper>
                    }
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={()=>changeZipcodeStatus(ZipcodeStatus.None,[])}
                        color='default'
                        variant='contained'>
                            戻る
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

AddressSearchDialog.propTypes = {
    changeZipcodeStatus: PropTypes.func.isRequired,
    setPreset: PropTypes.func.isRequired,
    zipcodeState: PropTypes.object.isRequired,
    submitZipcode: PropTypes.func.isRequired,
    changePage: PropTypes.func.isRequired,
    changePerPage: PropTypes.func.isRequired
};

export default AddressSearchDialog;