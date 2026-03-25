import React from 'react';
import { Icon } from '@iconify/react';

// Interface definition for PainPoint object structure
interface PainPoint {
    icon: string;           // Iconify icon name (e.g., 'solar:history-linear')
    iconBgColor: string;    // Tailwind background color class
    iconTextColor: string;  // Tailwind text color class
    title: string;          // Pain point title
    description: string;    // Pain point description text
}

// Main component: Displays compliance pain points in a grid layout
const CompliancePainPoints: React.FC = () => {

    // Array of pain point data - each object represents one card
    const painPoints: PainPoint[] = [
        {
            icon: 'solar:history-linear',
            iconBgColor: 'bg-red-50',
            iconTextColor: 'text-red-600',
            title: 'Operational Signals',
            description: 'Validate what suppliers actually do using activity and behavior data.',
        },
        {
            icon: 'solar:shield-warning-linear',
            iconBgColor: 'bg-amber-50',
            iconTextColor: 'text-amber-600',
            title: 'Corporate & Financial Data',
            description: 'Verify ownership, structure, and financial integrity.',
        },
        {
            icon: 'solar:user-cross-linear',
            iconBgColor: 'bg-slate-200',
            iconTextColor: 'text-slate-600',
            title: 'Real-Time Risk Monitoring',
            description: 'Track global events, trade flows, and disruptions affecting orders arriving on time.',
        },
    ];

    return (
        // Outer container: White background with vertical padding
        <div className="bg-white py-16 md:py-20">

            {/* Max-width container with horizontal padding */}
            <div className="max-w-7xl mx-auto px-6">

                {/* Header section: Centered text with max width */}
                <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#0B2545] tracking-tight mb-4">
                        Track supplier operations, ownership, and global risk factors to ensure every transaction is compliant before approval.
                    </h2>
                </div>

                {/* Grid container: 3 columns on medium+ screens, single column on mobile */}
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">

                    {/* Map through painPoints array to create cards */}
                    {painPoints.map((point, index) => (

                        // Individual card: Rounded box with hover effects
                        <div
                            key={index}
                            className="p-6 md:p-8 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200"
                        >

                            {/* Icon container: Colored background with centered icon */}
                            <div
                                className={`w-12 h-12 rounded-lg ${point.iconBgColor} ${point.iconTextColor} flex items-center justify-center mb-4`}
                            >
                                <Icon icon={point.icon} width="24" />
                            </div>

                            {/* Card title */}
                            <h3 className="text-xl font-semibold text-[#0B2545] mb-4">
                                {point.title}
                            </h3>

                            {/* Card description */}
                            <p className="text-base text-slate-600 leading-7">
                                {point.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Export component for use in other files
export default CompliancePainPoints;