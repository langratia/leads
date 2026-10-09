import type { FC, SVGProps } from "react";

export interface AbstractIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/** Abstract Brand Logo: Futuristic geometric crystal / interlocking hexagonal prism */
export const AbstractBrandLogo: FC<AbstractIconProps> = ({ className = "h-7 w-7", ...props }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="brandGrad1" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="brandGrad2" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    {/* Base isometric hexagon facets */}
    <path d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z" stroke="url(#brandGrad1)" strokeWidth="1.8" strokeLinejoin="round" fill="url(#brandGrad2)" />
    <path d="M16 3V16M16 16L28 22.5M16 16L4 22.5" stroke="url(#brandGrad1)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3" fill="#38bdf8" className="animate-pulse" />
  </svg>
);

/** Abstract Autonomous AI Agent Icon: Quantum core with orbital sparks */
export const AgentIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="11" r="2" fill="currentColor" />
    <circle cx="19" cy="4" r="1" fill="currentColor" />
    <circle cx="5" cy="18" r="1" fill="currentColor" />
  </svg>
);

/** Abstract Overview Icon: Multi-tier matrix grid */
export const OverviewIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.1" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

/** Abstract Lead Finder Icon: Crosshair radar beacon */
export const FinderIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.1" />
    <circle cx="11" cy="11" r="3" strokeWidth="1.5" />
    <path d="M11 3V5M11 17V19M3 11H5M17 11H19M17 17L21 21" />
  </svg>
);

/** Abstract Inquiries Icon: Convergent intake vector */
export const InquiriesIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 4H20V15C20 16.1 19.1 17 18 17H14.5L12 19.5L9.5 17H6C4.9 17 4 16.1 4 15V4Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 9H16M8 13H12" strokeWidth="1.8" />
  </svg>
);

/** Abstract Pipeline Icon: Stepped flow columns */
export const PipelineIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 5C3 3.9 3.9 3 5 3H7C8.1 3 9 3.9 9 5V19C9 20.1 8.1 21 7 21H5C3.9 21 3 20.1 3 19V5Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M10 8C10 6.9 10.9 6 12 6H14C15.1 6 16 6.9 16 8V19C16 20.1 15.1 21 14 21H12C10.9 21 10 20.1 10 19V8Z" fill="currentColor" fillOpacity="0.12" />
    <path d="M17 12C17 10.9 17.9 10 19 10H21C22.1 10 23 10.9 23 12V19C23 20.1 22.1 21 21 21H19C17.9 21 17 20.1 17 19V12Z" fill="currentColor" fillOpacity="0.08" />
  </svg>
);

/** Abstract All Leads Icon: Geometric matrix ledger */
export const AllLeadsIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.08" />
    <path d="M3 9H21M9 9V20M3 15H9" />
    <circle cx="6" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

/** Abstract Customers Icon: Gemstone vault / closed won crown */
export const CustomersIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M6 3L2 9L12 21L22 9L18 3H6Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M2 9H22M12 21L7.5 9L10 3M12 21L16.5 9L14 3" strokeWidth="1.5" />
  </svg>
);

/** Abstract Follow-ups Icon: Orbital chronological arc */
export const FollowupsIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 7V12L15.5 15" strokeWidth="2" strokeLinecap="round" />
    <path d="M19.5 4.5L21 6" strokeLinecap="round" />
  </svg>
);

/** Abstract Email Outreach Icon: Supersonic packet signal */
export const EmailsIcon: FC<AbstractIconProps> = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2 5L22 12L2 19L5 12L2 5Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M5 12H15" strokeWidth="1.8" />
    <circle cx="19" cy="5" r="1.5" fill="currentColor" />
  </svg>
);
