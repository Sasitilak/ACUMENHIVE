import React from 'react';
import { Box, Container, Typography, Paper, Divider, Stack } from '@mui/material';

const TermsOfService: React.FC = () => {
    return (
        <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '80vh' }}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        Terms of Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Updated: March 1, 2026
                    </Typography>

                    <Divider sx={{ my: 4 }} />

                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>1. Acceptance of Terms</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                By accessing and using the Acumen Hive platform, you agree to comply with and be bound by these Terms of Service.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>2. Use of Services</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Our services are intended for use by students and working professionals seeking study space. We reserve the right to refuse service to anyone for any reason.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>3. Queries & Refunds</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                For any queries, support, or refund requests, please contact us directly at our support number: <strong>+91 91824 82534</strong>. We do not promise any refunds for bookings, and all decisions will be final.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>4. Limitation of Liability</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Acumen Hive is not liable for any direct or indirect damages resulting from the use of our services or facilities.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsOfService;
