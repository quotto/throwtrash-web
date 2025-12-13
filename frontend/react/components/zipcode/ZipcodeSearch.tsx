import React from 'react';
import NumberFormat from 'react-number-format';
import { Button, CircularProgress, createStyles, FormControl, FormGroup, FormLabel, Grid, InputAdornment, TextField, Theme, Tooltip, FormHelperText } from '@mui/material';
import { withStyles, WithStyles } from '@mui/styles';
import { Help } from '@mui/icons-material';
import { MainProps } from '../../types/props';
import { ZipcodeStatus } from '../../reducers/ZipcodeReducer';
import AddressSearchDialog from './AddressSearchDiallog';
import ResultDialog from './ResultDiallog';
import { searchZipcode, loadAddress } from '../../lib/api-client';

const styles = (_: Theme)=>createStyles({
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
function ZipcodeSearch(props: Props) {
    const { classes, zipcodeState, changeZipcode, submitZipcode } = props;
    return (
        <Grid container item xs={12} justifyContent='center' style={{marginBottom: '10px'}}>
            {zipcodeState.submitting ?
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
                        {/* @ts-ignore react-number-format 型差異を無視 */}
                        <NumberFormat
                            value={zipcodeState.zipcode}
                            allowNegative={false}
                            isAllowed={(values: any)=>isMaxValue(Number(values))}
                            onValueChange={(values: any)=>{
                                changeZipcode(String(values));
                            }}
                        />
                        <Button
                            onClick={()=> submitZipcode(true)}
                            variant='contained'
                            color='secondary'
                            disabled={zipcodeState.zipcode.length != 7}>
                            検索
                        </Button>
                    </FormGroup>
                    {zipcodeState.error && <FormHelperText error>{zipcodeState.error}</FormHelperText>}
                </FormControl>
            }
            <AddressSearchDialog {...props} />
            <ResultDialog {...props} />
        </Grid>
    );
}

export default withStyles(styles)(ZipcodeSearch);
