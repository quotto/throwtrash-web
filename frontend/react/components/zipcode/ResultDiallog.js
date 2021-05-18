import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, withStyles } from '@material-ui/core';
import React from 'react';
import PropTypes from 'prop-types';
import { ZipcodeStatus } from '../../reducers/ZipcodeReducer';


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

class ResultDialog extends React.Component {
    render() {
        const { changeZipcodeStatus, setPreset, changePage, changePerPage } = this.props;
        const { status, trash_page_state } = this.props.zipcodeState;
        const { trash_list, trash_text_list, per_page, current_page } = trash_page_state;
        return (
            <Dialog
                open={status === ZipcodeStatus.ResultSelect}
            >
                <DialogTitle
                    id='result-dialog-title'>
                        検索結果
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        設定したいゴミ出し予定をクリックしてください。
                    </DialogContentText>
                    <TableContainer component={Paper}>
                        <Table size='small' arial-label='trashes-table'>
                            <TableBody>
                                { trash_list.slice(current_page * per_page, current_page * per_page + per_page).map((trash,index)=>{
                                    return (<StyledTableRow 
                                        key={index}
                                        onClick={(_)=>{
                                            setPreset(trash);
                                            changeZipcodeStatus(ZipcodeStatus.None);
                                        }}
                                    >
                                        <TableCell component='th' scope='row'>
                                            {trash_text_list[index]}
                                        </TableCell>
                                    </StyledTableRow>);
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* TODO: ページネーションロジック未実装 */ }
                    {trash_page_state.trash_list.length > 5 && <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={trash_page_state.trash_list.length}
                        rowsPerPage={trash_page_state.per_page}
                        page={trash_page_state.current_page}
                        labelRowsPerPage='1ページあたりの行数'
                        onChangePage={(e,new_page)=>changePage(new_page)}
                        onChangeRowsPerPage={(e)=>{
                            console.log(e);
                            changePerPage(e.target.value);
                            changePage(0);
                        }}
                    />}
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

ResultDialog.propTypes = {
    changeZipcodeStatus: PropTypes.func.isRequired,
    setPreset: PropTypes.func.isRequired,
    zipcodeState: PropTypes.object.isRequired,
    changePage: PropTypes.func.isRequired,
    changePerPage: PropTypes.func.isRequired
};

export default ResultDialog;