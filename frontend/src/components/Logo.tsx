interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo = ({ size = 32, className }: LogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="TaskFlow logo"
  >
    <defs>
      <linearGradient id="tf-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="6" fill="url(#tf-grad)" />
    <path
      d="M8 17l5 5 11-12"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const Logo32 = () => <Logo size={32} />;
export const Logo24 = () => <Logo size={24} />;
