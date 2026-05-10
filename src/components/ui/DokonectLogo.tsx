interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
  dark?: boolean;
}

const DokonectLogo = ({ size = 40, variant = 'full', className = '', dark = false }: LogoProps) => {
  const gid = `dg-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        {/* D shape */}
        <path
          d="M20 20 L50 20 C70 20 85 35 85 50 C85 65 70 80 50 80 L20 80 Z"
          fill={`url(#${gid})`}
        />
        {/* Inner white D */}
        <path d="M32 32 H46 C58 32 68 42 68 50 C68 58 58 68 46 68 H32 Z" fill="white" />
        {/* Connection dots */}
        <circle cx="44" cy="40" r="4" fill={`url(#${gid})`} />
        <circle cx="56" cy="50" r="4" fill={`url(#${gid})`} />
        <circle cx="44" cy="60" r="4" fill={`url(#${gid})`} />
        {/* Connection lines */}
        <line x1="44" y1="40" x2="56" y2="50" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="56" y1="50" x2="44" y2="60" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {variant === 'full' && (
        <span
          style={{
            fontWeight: 800,
            fontSize: size * 0.5,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: dark ? '#0D1526' : '#3B82F6',
            fontFamily: "'DM Sans', 'Outfit', 'Inter', sans-serif",
          }}>
          Dokonect
        </span>
      )}
    </div>
  );
};

export default DokonectLogo;
