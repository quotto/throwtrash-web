import { Button, CircularProgress, FormControl, FormGroup, FormLabel, Grid, InputAdornment, TextField, Tooltip, withStyles } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import NumberFormat from 'react-number-format';
import { ZipcodeStatus } from '../../reducers/ZipcodeReducer';
import ResultDialog from './ResultDiallog';

const styles = (_)=>({
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


const ZipcodeTextField = (props)=>{
    return (
        <TextField
            {...props}
            variant='outlined'
            label='郵便番号（ハイフン不要）'
            size='small'
            InputProps={{
                startAdornment: <InputAdornment position="start">〒</InputAdornment>,
            }}
            error={props.zipcodeState.error}
            helperText={props.zipcodeState.error}
        />
    );
};

ZipcodeTextField.propTypes = {
    zipcodeState: PropTypes.object.isRequired
};

const isMaxValue = (inputObj)=>{
    const {value} = inputObj;
    return value <= 9999999;
};
class ZipcodeSearch extends React.Component {
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
                                isAllowed={isMaxValue}
                                customInput={ ZipcodeTextField }
                                onChange={(e)=>{
                                    console.log('change zipcode');
                                    changeZipcode(e.target.value);
                                }}
                                zipcodeState={zipcodeState}
                            >
                            </NumberFormat>
                            <Button 
                                onClick={()=> {
                                    submitZipcode(true);
                                    axios.get(
                                        `https://zipcode.mythrowaway.net/search?zipcode=${zipcodeState.zipcode}`
                                    ).then(async(response)=>{
                                        if(response.status === 200) {
                                            console.log(response.data);
                                            if(response.data.address.length === 0) {
                                                setErrorZipcode();
                                            } else if(response.data.address.length === 1) {
                                                await axios.get(`https://zipcode.mythrowaway.net/load?address=${response.data.address[0]}`).then((response)=>{
                                                    console.log(response.data);
                                                    // ページネーション表示
                                                    changeZipcodeStatus(ZipcodeStatus.ResultSelect,response.data);
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
                <ResultDialog {...this.props} />
            </Grid>
        );
    }
}

ZipcodeSearch.propTypes = {
    classes: PropTypes.object,
    zipcodeState: PropTypes.object.isRequired,
    changeZipcode: PropTypes.func.isRequired,
    submitZipcode: PropTypes.func.isRequired,
    changeZipcodeStatus: PropTypes.func.isRequired,
    setErrorZipcode: PropTypes.func.isRequired
};

export default withStyles(styles)(ZipcodeSearch);