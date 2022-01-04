import { Button, CircularProgress, createStyles, FormControl, FormGroup, FormLabel, Grid, InputAdornment, TextField, Theme, Tooltip, withStyles, WithStyles } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import NumberFormat from 'react-number-format';
import { MainProps } from '../../containers/MainContainer';
import { ZipcodeStatus } from '../../reducers/ZipcodeReducer';
import AddressSearchDialog from './AddressSearchDiallog';
import ResultDialog from './ResultDiallog';

const styles = (_: any)=>createStyles({
    ZipcodeFormLabel: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    },
    ZipcodeFormGroup: {
        alignItems: 'flex-start',
        '& :first-child': {
            marginRight: '5px'
        },
    }
});

const ZipcodeTextField = (props:Props)=>{
    return (
        <TextField
            variant='outlined'
            label='郵便番号（ハイフン不要）'
            size='small'
            InputProps={{
                startAdornment: <InputAdornment position="start">〒</InputAdornment>,
            }}
            error={typeof(props.zipcodeState.error) != 'undefined'}
            helperText={props.zipcodeState.error}
        />
    );
};

const isMaxValue = (inputValue: number )=>{
    return inputValue <= 9999999;
};

interface Props extends MainProps,WithStyles<typeof styles>{}
class ZipcodeSearch extends React.Component<Props,{}> {
    render() {
        const {classes, zipcodeState, changeZipcode, submitZipcode, changeZipcodeStatus, setErrorZipcode } = this.props;
        return (
            <Grid container item xs={12} justify='center' style={{marginBottom: '10px'}}>
                {zipcodeState.submitting?
                    <CircularProgress /> :
                    <FormControl>
                        <FormLabel
                            component='legend'
                            className={classes.ZipcodeFormLabel}
                        >
                            <span>近くのゴミ出し予定を探してみる</span>
                            <Tooltip
                                title='同じ地域のユーザーが登録したゴミ出し予定を検索して自動入力できます。'
                                placement='top'
                                arial-label='description'>
                                <Help fontSize='small'/>
                            </Tooltip>
                        </FormLabel>
                        <FormGroup row className={classes.ZipcodeFormGroup}>
                            <NumberFormat
                                value={zipcodeState.zipcode}
                                allowNegative={false}
                                isAllowed={(values)=>isMaxValue(Number(values))}
                                // customInput={ ZipcodeTextField(this.props) }
                                onValueChange={(values)=>{
                                    console.log('change zipcode');
                                    changeZipcode(String(values));
                                }}
                                // zipcodeState={zipcodeState}
                            >
                            </NumberFormat>
                            <Button
                                onClick={()=> {
                                    submitZipcode(true);
                                    axios.get(
                                        `https://zipcode.mythrowaway.net/search?zipcode=${zipcodeState.zipcode}`
                                    ).then(async(response)=>{
                                        if(response.status === 200) {
                                            if(response.data.address.length === 0) {
                                                setErrorZipcode();
                                            } else if(response.data.address.length === 1) {
                                                await axios.get(`https://zipcode.mythrowaway.net/load?address=${response.data.address[0]}`).then((response)=>{
                                                    // ページネーション表示
                                                    changeZipcodeStatus(ZipcodeStatus.ResultSelect,response.data.data);
                                                }).catch(error=>console.error(error));
                                            } else {
                                                // 住所選択モード
                                                changeZipcodeStatus(ZipcodeStatus.AddressSelect,response.data.address);
                                            }
                                        }
                                    }).catch(error=>{
                                        console.error(error);
                                        setErrorZipcode();
                                    }).finally(()=>{
                                        submitZipcode(false);
                                    });
                                }}
                                variant='contained'
                                color='secondary'
                                disabled={zipcodeState.zipcode.length != 7}>
                                検索
                            </Button>
                        </FormGroup>
                    </FormControl>
                }
                <AddressSearchDialog {...this.props} />
                <ResultDialog {...this.props} />
            </Grid>
        );
    }
}

export default withStyles(styles)(ZipcodeSearch);