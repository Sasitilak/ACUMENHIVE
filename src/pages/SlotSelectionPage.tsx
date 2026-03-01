import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, Typography, Grid, Button, Paper, Alert, useTheme,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useBooking } from '../context/BookingContext';
import { getHolidays } from '../services/api';
import type { Holiday } from '../types/booking';

const SlotSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { setSelectedDate, setSelectedSlot } = useBooking();

    // Duration selectors
    const [months, setMonths] = useState(0);
    const [weeks, setWeeks] = useState(1);

    // Date state
    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getHolidays().then(setHolidays).catch(console.error);
    }, []);

    // Auto-convert 4 weeks to 1 month
    useEffect(() => {
        if (weeks >= 4) {
            setMonths(m => m + 1);
            setWeeks(0);
        }
    }, [weeks]);

    // Calculate To date and total days using calendar-month logic
    const toDate = useMemo(() => {
        if (!fromDate) return null;
        let date = fromDate;
        if (months > 0) date = date.add(months, 'month');
        if (weeks > 0) date = date.add(weeks, 'week');
        return date; // e.g. 5th to 5th
    }, [fromDate, months, weeks]);

    const totalDays = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        return toDate.diff(fromDate, 'day') + 1;
    }, [fromDate, toDate]);



    // Validation
    useEffect(() => {
        if (totalDays > 0 && totalDays < 7) {
            setError('Minimum booking period is 1 week');
        } else {
            setError(null);
        }
    }, [totalDays]);

    const shouldDisableDate = (date: Dayjs) => {
        const formatted = date.format('YYYY-MM-DD');
        return holidays.some(h => h.date === formatted && (h.branchId === null));
    };

    const handleContinue = () => {
        if (!fromDate || !toDate || error || totalDays < 7) return;
        setSelectedDate(`${fromDate.format('YYYY-MM-DD')} to ${toDate.format('YYYY-MM-DD')}`);
        setSelectedSlot({
            id: `slot-${fromDate.format('YYYYMMDD')}-${toDate.format('YYYYMMDD')}`,
            time: durationLabel,
            available: true,
            price: 0, // Will be set in LocationSelectionPage
            durationDays: totalDays,
            effectiveWeeks: months * 4 + weeks,
        });
        navigate('/location');
    };

    const valid = fromDate && !error && totalDays >= 7;

    // Duration label for display
    const durationParts: string[] = [];
    if (months > 0) durationParts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (weeks > 0) durationParts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    const durationLabel = durationParts.join(' + ') || 'Select duration';

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box className="animate-fade-in-up" sx={{ mb: 4 }}>
                <Typography variant="h3" gutterBottom>Select Duration</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 600 }}>Choose how long you'd like to book. You'll be able to see room-specific pricing in the next step.</Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {/* Center: Controls */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Duration Picker */}
                    <Paper
                        elevation={0}
                        className="animate-fade-in-up stagger-1"
                        sx={{
                            p: 4, mb: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            background: isDark ? 'rgba(19,25,39,0.5)' : 'rgba(255,255,255,0.9)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <CalendarMonthIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>Booking Duration</Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Months</InputLabel>
                                    <Select
                                        value={months}
                                        label="Months"
                                        onChange={(e) => setMonths(Number(e.target.value))}
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6].map(m => (
                                            <MenuItem key={m} value={m}>
                                                {m === 0 ? '0 months' : `${m} month${m > 1 ? 's' : ''}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Weeks</InputLabel>
                                    <Select
                                        value={weeks}
                                        label="Weeks"
                                        onChange={(e) => setWeeks(Number(e.target.value))}
                                    >
                                        {[0, 1, 2, 3, 4].map(w => (
                                            <MenuItem key={w} value={w}>
                                                {w === 0 ? '0 weeks' : w === 4 ? '4 weeks (becomes 1 month)' : `${w} week${w > 1 ? 's' : ''}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Duration display */}
                        {totalDays > 0 && (
                            <Box sx={{
                                mt: 3, p: 2, borderRadius: 2,
                                bgcolor: isDark ? 'rgba(0,173,181,0.08)' : 'rgba(59,172,182,0.06)',
                                border: `1px solid ${isDark ? 'rgba(0,173,181,0.2)' : 'rgba(59,172,182,0.15)'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Selected Duration</Typography>
                                    <Typography variant="h6" fontWeight={700}>{durationLabel}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">Total Days</Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary.main">{totalDays} days</Typography>
                                </Box>
                            </Box>
                        )}
                    </Paper>

                    {/* Start Date Picker */}
                    <Paper
                        elevation={0}
                        className="animate-fade-in-up stagger-2"
                        sx={{ p: 4, mb: 3, border: `1px solid ${theme.palette.divider}` }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <CalendarMonthIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>Start Date</Typography>
                        </Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>From</Typography>
                                    <DatePicker
                                        value={fromDate}
                                        onChange={v => setFromDate(v)}
                                        shouldDisableDate={shouldDisableDate}
                                        format="DD/MM/YYYY"
                                        minDate={dayjs()}
                                        maxDate={dayjs().add(90, 'day')}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>To (auto-calculated)</Typography>
                                    <DatePicker
                                        value={toDate}
                                        readOnly
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: { '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                    </Paper>

                </Grid>
            </Grid>

            {valid && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleContinue}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ px: 6, py: 1.5 }}
                    >
                        Continue to Location Selection
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default SlotSelectionPage;
