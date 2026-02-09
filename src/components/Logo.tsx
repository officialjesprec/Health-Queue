import React from 'react';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    showText?: boolean;
    variant?: 'full' | 'icon' | 'text';
}

export const Logo: React.FC<LogoProps> = ({
    className = '',
    width,
    height,
    showText = true,
    variant = 'full'
}) => {
    if (variant === 'icon') {
        return (
            <svg
                width={width || 60}
                height={height || 60}
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                {/* Background */}
                <rect width="60" height="60" rx="12" fill="#F0FDFA" />

                {/* Medical Cross */}
                <g transform="translate(30, 30)">
                    <rect x="-7" y="-20" width="14" height="40" rx="3.5" fill="#0891B2" />
                    <rect x="-20" y="-7" width="40" height="14" rx="3.5" fill="#0891B2" />
                    <circle cx="0" cy="0" r="7" fill="#22C55E" />
                    <circle cx="0" cy="0" r="3.5" fill="white" />
                </g>

                {/* Pulse wave */}
                <path
                    d="M8 50 L12 50 L16 44 L20 56 L24 46 L28 50 L52 50"
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.6"
                />
            </svg>
        );
    }

    if (variant === 'text') {
        return (
            <div className={`flex items-center ${className}`}>
                <span className="font-heading text-2xl font-bold text-healthcare-text">
                    Health<span className="text-primary-500">Queue</span>
                </span>
            </div>
        );
    }

    // Full logo with icon and text
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width={width || 60}
                height={height || 60}
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background */}
                <rect width="60" height="60" rx="12" fill="#F0FDFA" />

                {/* Medical Cross */}
                <g transform="translate(30, 30)">
                    <rect x="-7" y="-20" width="14" height="40" rx="3.5" fill="#0891B2" />
                    <rect x="-20" y="-7" width="40" height="14" rx="3.5" fill="#0891B2" />
                    <circle cx="0" cy="0" r="7" fill="#22C55E" />
                    <circle cx="0" cy="0" r="3.5" fill="white" />
                </g>

                {/* Pulse wave */}
                <path
                    d="M8 50 L12 50 L16 44 L20 56 L24 46 L28 50 L52 50"
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.6"
                />
            </svg>

            {showText && (
                <div className="flex flex-col">
                    <span className="font-heading text-2xl font-bold text-healthcare-text leading-tight">
                        Health<span className="text-primary-500">Queue</span>
                    </span>
                    <span className="text-xs text-healthcare-muted font-body">
                        Healthcare Without The Waiting
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
