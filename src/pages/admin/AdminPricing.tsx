import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    CircularProgress, Snackbar, Alert, useTheme,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { getPricingRules, updatePricingRule, getBranches } from '../../services/api';
import type { PricingConfig, Branch } from '../../types/booking';

const AdminPricing: React.FC = () => {
    const theme = useTheme();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // "branchId-isAc" being saved
    const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

    // Track edits locally
    const [editedRules, setEditedRules] = useState<Record<string, PricingConfig>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchData, rulesData] = await Promise.all([getBranches(), getPricingRules()]);
            setBranches(branchData);

            // Initialize edits from loaded rules
            const edits: Record<string, PricingConfig> = {};
            rulesData.forEach(r => {
                edits[ruleKey(r.branchId, r.isAc)] = { ...r.tiers };
            });

            // Also create default entries for branches that don't have rules yet
            branchData.forEach(b => {
                [true, false].forEach(isAc => {
                    const key = ruleKey(b.id, isAc);
                    if (!edits[key]) {
                        edits[key] = {
                            price_1w: 500,
                            price_2w: 900,
                            price_3w: 1200,
                            price_1m: 1500
                        };
                    }
                });
            });

            setEditedRules(edits);
        } catch (err) {
            console.error(err);
            setSnack({ msg: 'Failed to load pricing data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const ruleKey = (branchId: number, isAc: boolean) => `${branchId}-${isAc}`;

    const handleRateChange = (key: string, field: keyof PricingConfig, value: number) => {
        setEditedRules(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleSave = async (branchId: number, isAc: boolean) => {
        const key = ruleKey(branchId, isAc);
        const tiers = editedRules[key];
        if (!tiers) return;

        setSaving(key);
        try {
            await updatePricingRule(branchId, isAc, tiers);
            setSnack({ msg: 'Pricing saved successfully!', severity: 'success' });
        } catch (err: any) {
            setSnack({ msg: err.message || 'Failed to save pricing', severity: 'error' });
        } finally {
            setSaving(null);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress />
        </Box>
    );

    // Group by branch
    const branchGroups = branches.map(branch => ({
        branch,
        configs: [
            { isAc: true, label: 'AC Rooms', key: ruleKey(branch.id, true) },
            { isAc: false, label: 'Non-AC Rooms', key: ruleKey(branch.id, false) },
        ]
    }));

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Pricing Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Set the absolute total price for each booking duration.
            </Typography>

            {branchGroups.map(({ branch, configs }) => (
                <Paper
                    key={branch.id}
                    elevation={0}
                    sx={{
                        mb: 4, p: { xs: 2, md: 3 },
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        {branch.name?.split('—')[0]?.trim() ?? `Branch ${branch.id}`}
                    </Typography>

                    {configs.map(({ isAc, label, key }) => {
                        const tiers = editedRules[key];
                        const isSaving = saving === key;
                        if (!tiers) return null;

                        return (
                            <Box key={key} sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                    {isAc && <AcUnitIcon color="info" sx={{ fontSize: 18 }} />}
                                    <Typography variant="subtitle1" fontWeight={700}>{label}</Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    {[
                                        { field: 'price_1w', label: '1 Week Rate' },
                                        { field: 'price_2w', label: '2 Week Rate' },
                                        { field: 'price_3w', label: '3 Week Rate' },
                                        { field: 'price_1m', label: '1 Month Rate' },
                                    ].map((tier) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tier.field}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                                {tier.label}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                fullWidth
                                                value={tiers[tier.field as keyof PricingConfig] || 0}
                                                onChange={e => handleRateChange(key, tier.field as keyof PricingConfig, parseInt(e.target.value) || 0)}
                                                inputProps={{ min: 0 }}
                                                InputProps={{
                                                    startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>₹</Typography>
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{ mt: 2.5 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                                        onClick={() => handleSave(branch.id, isAc)}
                                        disabled={isSaving}
                                        sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}
                                    >
                                        {isSaving ? 'Saving...' : 'Update Pricing'}
                                    </Button>
                                </Box>

                                {isAc && <Divider sx={{ mt: 4 }} />}
                            </Box>
                        );
                    })}
                </Paper>
            ))}

            {snack && (
                <Snackbar open autoHideDuration={4000} onClose={() => setSnack(null)}>
                    <Alert severity={snack.severity} sx={{ width: '100%', borderRadius: 3 }}>
                        {snack.msg}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default AdminPricing;
