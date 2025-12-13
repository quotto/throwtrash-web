import React from 'react';
import TrashSchedule from './TrashSchedule';
import { Button, Grid, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { WithTranslation, withTranslation } from 'react-i18next';
import ErrorDialog from './ErrorDialog';
import { green } from '@mui/material/colors';
import { MainProps } from '../types/props';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import { submitTrashes } from '../lib/api-client';

const styles = createStyles({
    TopMessage: {
        textAlign: 'center',
    }
});

interface Props extends MainProps, WithStyles<typeof styles>, WithTranslation {}

const MAX_SCHEDULE = 10;

const Main = withStyles(styles)(
    class extends React.Component<Props, {}> {
        constructor(props: Props) {
            super(props);
            this.handleSubmit = this.handleSubmit.bind(this);
        }

        async handleSubmit() {
            try {
                this.props.onSubmit(true);
                const res = await submitTrashes({
                    data: this.props.trashes,
                    offset: new Date().getTimezoneOffset(),
                    nextdayflag: this.props.nextday_checked ?? true
                });
                if (res) {
                    (window as any).location = res;
                }
            } catch (e) {
                this.props.onError(true);
                this.props.onSubmit(false);
            }
        }

        render() {
            // classes を子に渡さない（MUIの classes key 不一致警告を防ぐ）
            const { classes, t, ...rest } = this.props;
            return (
                <Grid container justifyContent='center' item xs={12} spacing={0} style={{ flexBasis: '90%' }}>
                    <Grid item xs={12} className={classes.TopMessage}>
                        <ul style={{ display: 'inline-block', textAlign: 'left' }}>
                            <li>{t('App.description.trash')}</li>
                            <li>{t('App.description.schedule')}</li>
                        </ul>
                    </Grid>
                    <div
                        data-title={t('IntroJS.main.title')}
                        data-intro={t('IntroJS.main.hint')}
                        data-step={1}
                    >
                        <TrashSchedule {...rest} />
                    </div>
                    <Grid container justifyContent='center' direction='column' alignItems='center' spacing={3}>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                disabled={this.props.trashes.length === MAX_SCHEDULE}
                                onClick={() => this.props.onClickAdd()}>
                                {t('ScheduleList.button.addtrash')}
                            </Button>
                        </Grid>
                        <Grid item
                            data-title={t('IntroJS.nextday.title')}
                            data-intro={t('IntroJS.nextday.hint')}
                            data-step={2}
                        >
                            <Tooltip
                                title={t('App.checkbox.description')}
                                placement='top'
                                arial-label='description'>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={this.props.nextday_checked}
                                        style={{ color: green[600] }}
                                        onChange={(event) => this.props.onChangeNextdayCheck(event.target.checked)} />
                                    }
                                    label={t('App.checkbox.nextday')} />
                            </Tooltip>
                        </Grid>
                        <ErrorDialog {...this.props} />
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={this.props.submit_error || this.props.submitting}
                                onClick={this.handleSubmit}>
                                {t('ScheduleList.button.regist')}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            );
        }
    }
);
export default withTranslation()(Main);
