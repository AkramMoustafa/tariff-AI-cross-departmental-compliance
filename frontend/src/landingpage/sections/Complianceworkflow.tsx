import React from 'react';

// Import Material-UI components for styling and layout
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Container } from '@mui/material';
import { useState } from 'react';


// Import Material-UI icons used in the workflow steps
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

// Interface definition for WorkflowStep object structure
interface WorkflowStep {
    icon: React.ReactNode;  // MUI icon component
    iconBgColor: string;    // Background color for icon container 
    iconTextColor: string;  // Text/icon color
    title: string;          // Step title text
    description: string;    // Step description text
}



// Theme configuration for Material-UI components
const theme = createTheme({
    palette: {
        primary: {
            main: '#0FA3A3',
        },
        secondary: {
            main: '#F7A34B',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0B2545',
            secondary: '#64748b',
        },
    },
    typography: {

        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
});

// Main component: Displays compliance workflow steps in a horizontal flow
const ComplianceWorkflow: React.FC = () => {

    // Array of workflow step data - each object represents one step card
    const workflowSteps: WorkflowStep[] = [
        {
            icon: <BadgeOutlinedIcon sx={{ fontSize: 24 }} />,
            iconBgColor: 'rgba(15, 163, 163, 0.2)',
            iconTextColor: '#0FA3A3',
            title: 'Upload PO',
            description: 'Upload PDF OR manual form and show extracted field',
        },
        {
            icon: <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />,
            iconBgColor: 'rgba(247, 163, 75, 0.2)',
            iconTextColor: '#F7A34B',
            title: 'Run Risk Engine',
            description: 'Analyze disruptions, sanctions, weather, and global events to simulate delay and risk.'
        },
        {
            icon: <VerifiedOutlinedIcon sx={{ fontSize: 24 }} />,
            iconBgColor: 'rgba(16, 185, 129, 0.2)',
            iconTextColor: '#10b981',
            title: 'Decision Output',
            description: 'Receive predicted delay, financial exposure, and recommended mitigation action.'
        },
    ];

const [poData, setPoData] = useState<any>(null);
const [result, setResult] = useState<any>(null);
const [loading, setLoading] = useState(false);
const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // simulate extraction (replace later with API)
    setPoData({
        origin: "Shenzhen, CN",
        destination: "Rotterdam, NL",
        product: "Pharmaceuticals",
        value: 1800000
    });
};const runSimulation = async () => {
    setLoading(true);

    // 🔥 Replace this with your backend call later
    setTimeout(() => {
        setResult({
            risk: "HIGH",
            delay: 15.3,
            action: "Expedited Air Freight",
            exposure: 1238135
        });
        setLoading(false);
    }, 1500);
};
    return (
        // Wrap component in ThemeProvider to apply custom theme
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                id="solutions"
                component="section"
                sx={{
                    backgroundColor: '#0B2545',  // Dark blue background
                    py: { xs: 8, md: 12 },       // Responsive padding
                    position: 'relative',
                }}
            >

                <Container maxWidth="lg" sx={{ px: 3 }}>

                    {/* Header section: Centered title and description */}
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 8,
                            maxWidth: '48rem',
                            mx: 'auto',
                        }}
                    >
                        {/* Main heading */}
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.875rem', md: '2.25rem' },
                                fontWeight: 600,
                                letterSpacing: '-0.025em',
                                mb: 2,
                                color: '#ffffff',
                            }}
                        >
                            AI-Powered Purchase Order Risk Simulation
                        </Typography>

                        {/* Subheading/description text */}
                        <Typography
                            sx={{
                                fontSize: '1rem',
                                color: '#cbd5e1',
                                lineHeight: 1.6,
                            }}
                        >
                         Upload a purchase order, simulate disruptions, and receive delay predictions, financial exposure, and recommended actions instantly.
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 3, md: 0 },
                            maxWidth: '80rem',
                            mx: 'auto',
                        }}
                    >
                        {/* Map through workflowSteps array to create step cards */}
                        {workflowSteps.map((step, index) => (
                            <React.Fragment key={index}>

                                {/* Individual step card: Glass morphism effect with blur */}
                                <Box
                                    sx={{
                                        flex: 1,                           // Equal width for all cards
                                        width: '100%',
                                        p: 4,
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',  // Semi-transparent white
                                        border: '1px solid rgba(255, 255, 255, 0.15)', // Light border
                                        borderRadius: '0.75rem',           // Rounded corners
                                        textAlign: 'center',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Slightly brighter
                                            border: '1px solid rgba(255, 255, 255, 0.25)', // More visible border
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {/* Icon container: Colored background with centered icon */}
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            mx: 'auto',
                                            backgroundColor: step.iconBgColor,
                                            color: step.iconTextColor,
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        {step.icon}
                                    </Box>

                                    {/* Step title */}
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            mb: 1,
                                            color: '#ffffff',
                                        }}
                                    >
                                        {step.title}
                                    </Typography>

                                    {/* Step description */}
                                    <Typography
                                        sx={{
                                            fontSize: '0.875rem',
                                            color: '#94a3b8',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {step.description}
                                    </Typography>
                                </Box>

                                {/* Arrow between steps (only shown on desktop, not after last step) */}
                                {index < workflowSteps.length - 1 && (
                                    <Box
                                        sx={{
                                            display: { xs: 'none', md: 'flex' },
                                            color: '#cbd5e1',
                                            px: 2,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ArrowForwardIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};
export default ComplianceWorkflow;