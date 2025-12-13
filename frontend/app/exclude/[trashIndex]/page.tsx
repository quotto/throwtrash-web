"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Grid,
    Select,
    MenuItem,
    IconButton,
    Button,
    Alert,
    FormControl,
    InputLabel
} from '@mui/material';
import { AddCircle, HighlightOff } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { useExcludeDate, useTrashForm } from '../../providers/StoreProvider';
import { Action as ExcludeAction, initialExcludeDate } from '../../states/exclude-date';
import { Action as TrashAction } from '../../states/trash-form';
import { useTranslation } from 'react-i18next';
import '../../../react/lang/i18n';

export default function ExcludePage({ params }: { params: Promise<{ trashIndex: string }> }) {
    const router = useRouter();
    const { t } = useTranslation();
    const { state: excludeState, dispatch: dispatchExclude } = useExcludeDate();
    const { state: trashState, dispatch: dispatchTrash } = useTrashForm();
    const resolved = use(params);
    const trashIndex = Number(resolved.trashIndex);

    React.useEffect(() => {
        const target = trashState.trashes[trashIndex];
        if (!target) return;
        dispatchExclude({
            type: ExcludeAction.init,
            index: trashIndex,
            excludes: target.excludes ?? [initialExcludeDate]
        });
    }, [trashIndex, trashState.trashes, dispatchExclude]);

    const targetTrash = trashState.trashes[trashIndex];
    if (!targetTrash) {
        return <main>指定のゴミ種別が見つかりません。</main>;
    }
    const trashLabel = t(`TrashSchedule.select.trashtype.option.${targetTrash.type}`, { defaultValue: targetTrash.type });

    const isSubmitted = targetTrash.is_excludes_submitted;
    const isError = targetTrash.is_excludes_error;

    const monthDays = (month: number) => {
        if (month === 2) return 29;
        return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
    };

    const handleSubmit = () => {
        dispatchTrash({
            type: TrashAction.submitExclude,
            index: trashIndex,
            excludes: excludeState.excludes
        });
    };

    const handleBack = () => {
        dispatchTrash({ type: TrashAction.resetExcludeSubmit, index: trashIndex });
        router.back();
    };

    return (
        <main style={{ padding: '16px' }}>
            <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={12} textAlign="center">
                    <div style={{ fontSize: '1.5em' }}>
                        {trashLabel} の例外日設定（最大10件）
                    </div>
                </Grid>
                {excludeState.excludes.map((ex, idx) => {
                    const maxDate = monthDays(ex.month);
                    return (
                        <Grid item xs={12} container justifyContent="center" alignItems="center" key={`ex-${idx}`} gap={1}>
                            <FormControl>
                                <InputLabel id={`month-${idx}`}>月</InputLabel>
                                <Select
                                    labelId={`month-${idx}`}
                                    value={ex.month}
                                    label="月"
                                    onChange={(e) =>
                                        dispatchExclude({
                                            type: ExcludeAction.change,
                                            index: idx,
                                            month: e.target.value as number,
                                            date: ex.date
                                        })
                                    }
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <MenuItem value={m} key={`m-${m}`}>
                                            {m}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>月</div>
                            <FormControl>
                                <InputLabel id={`date-${idx}`}>日</InputLabel>
                                <Select
                                    labelId={`date-${idx}`}
                                    value={ex.date}
                                    label="日"
                                    onChange={(e) =>
                                        dispatchExclude({
                                            type: ExcludeAction.change,
                                            index: idx,
                                            month: ex.month,
                                            date: e.target.value as number
                                        })
                                    }
                                >
                                    {Array.from({ length: maxDate }, (_, i) => i + 1).map((d) => (
                                        <MenuItem value={d} key={`d-${d}`}>
                                            {d}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>日</div>
                            <IconButton color="error" onClick={() => dispatchExclude({ type: ExcludeAction.del, index: idx })}>
                                <HighlightOff />
                            </IconButton>
                        </Grid>
                    );
                })}
                {excludeState.excludes.length < 10 && (
                    <Grid item xs={12} textAlign="center">
                        <IconButton color="secondary" onClick={() => dispatchExclude({ type: ExcludeAction.add })}>
                            <AddCircle />
                        </IconButton>
                    </Grid>
                )}
                <Grid item xs={12} container justifyContent="center" gap={2}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        設定する
                    </Button>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: grey[500], color: '#fff' }}
                        onClick={handleBack}
                    >
                        戻る
                    </Button>
                </Grid>
                {isError && (
                    <Grid item xs={12}>
                        <Alert severity="error">エラーが発生したため設定できません。</Alert>
                    </Grid>
                )}
                {isSubmitted && (
                    <Grid item xs={12}>
                        <Alert severity="success">設定しました。</Alert>
                    </Grid>
                )}
            </Grid>
        </main>
    );
}
