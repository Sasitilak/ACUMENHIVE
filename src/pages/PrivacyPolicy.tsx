import React from 'react';
import { Box, Container, Typography, Paper, Divider, Stack } from '@mui/material';

const PrivacyPolicy: React.FC = () => {
    return (
        <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '80vh' }}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        Privacy Policy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Updated: March 1, 2026
                    </Typography>

                    <Divider sx={{ my: 4 }} />

                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>1. Information We Collect</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                We collect information you provide directly to us when you make a booking, including your name, phone number, and email address.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>2. Use of Information</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Your data won't be used for anything other than your booking confirmation. We don't share or use your data for any other purposes.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>3. Data Deletion Requests</Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                You have the right to request the deletion of your personal data from our systems. To make such a request, please contact our support team at <strong>acumenhive@gmail.com</strong>.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>4. Contact Us</Typography>
                            <Typography variant="body1" color="text.secondary">
                                If you have any questions about this Privacy Policy, please reach out to us at:
                                <br />
                                <strong>acumenhive@gmail.com</strong>
                                <br />
                                <strong>+91 91824 82534</strong>
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default PrivacyPolicy;
