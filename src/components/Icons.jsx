// Indian-themed SVG icon library — all inline, no external deps

export const MandalaIcon = ({ size = 32, color = "currentColor" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="32" cy="32" r="4" fill={color}/>
    <circle cx="32" cy="32" r="12"/>
    <circle cx="32" cy="32" r="20"/>
    <circle cx="32" cy="32" r="28"/>
    {[0,45,90,135,180,225,270,315].map(a => (
      <g key={a} transform={`rotate(${a} 32 32)`}>
        <circle cx="32" cy="12" r="2.5" fill={color}/>
        <path d="M32 16 Q34 22 32 28 Q30 22 32 16 Z" fill={color} opacity="0.7"/>
      </g>
    ))}
  </svg>
);

export const LotusIcon = ({ size = 24, color = "currentColor" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill={color}>
    <path d="M32 8 Q24 20 32 32 Q40 20 32 8 Z" opacity="0.9"/>
    <path d="M16 20 Q14 32 28 36 Q22 24 16 20 Z" opacity="0.7"/>
    <path d="M48 20 Q50 32 36 36 Q42 24 48 20 Z" opacity="0.7"/>
    <path d="M8 36 Q14 44 28 40 Q18 32 8 36 Z" opacity="0.5"/>
    <path d="M56 36 Q50 44 36 40 Q46 32 56 36 Z" opacity="0.5"/>
    <ellipse cx="32" cy="44" rx="20" ry="4" opacity="0.3"/>
  </svg>
);

export const DiyaIcon = ({ size = 28, color = "#FFB627" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size}>
    <ellipse cx="32" cy="48" rx="22" ry="6" fill="#8B4513"/>
    <path d="M10 46 Q32 56 54 46 Q52 40 32 40 Q12 40 10 46 Z" fill="#A0522D"/>
    <path d="M32 40 Q34 30 32 22 Q30 30 32 40 Z" fill={color}>
      <animate attributeName="d"
        values="M32 40 Q34 30 32 22 Q30 30 32 40 Z;
                M32 40 Q35 28 32 20 Q29 28 32 40 Z;
                M32 40 Q34 30 32 22 Q30 30 32 40 Z"
        dur="1.5s" repeatCount="indefinite"/>
    </path>
    <ellipse cx="32" cy="26" rx="2" ry="4" fill="#FFF8E7"/>
  </svg>
);

export const PeacockFeatherIcon = ({ size = 24, color = "#009B8E" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size}>
    <path d="M32 60 L32 30" stroke={color} strokeWidth="2"/>
    <ellipse cx="32" cy="22" rx="14" ry="20" fill={color} opacity="0.4"/>
    <ellipse cx="32" cy="20" rx="10" ry="14" fill="#3A0CA3" opacity="0.7"/>
    <ellipse cx="32" cy="20" rx="6" ry="9" fill="#FFB627"/>
    <ellipse cx="32" cy="20" rx="3" ry="5" fill="#FF6B35"/>
    <circle cx="32" cy="20" r="1.5" fill="#0A0420"/>
  </svg>
);

export const StarBurstIcon = ({ size = 24, color = "currentColor" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill={color}>
    <path d="M32 4 L36 26 L58 30 L36 34 L32 60 L28 34 L6 30 L28 26 Z" opacity="0.9"/>
  </svg>
);

export const BookIcon = ({ size = 22, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export const TrophyIcon = ({ size = 22, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

export const SparkleIcon = ({ size = 18, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z"/>
    <circle cx="19" cy="5" r="1.5"/>
    <circle cx="5" cy="19" r="1.5"/>
  </svg>
);

export const FireIcon = ({ size = 22, color = "#FF6B35" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M12 2c-1 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 1-2 0-5 0-8z"/>
    <path d="M12 13c-1 2-3 3-3 5a3 3 0 0 0 6 0c0-1-1-2-1-3-1 1-2 1-2-2z" opacity="0.8"/>
  </svg>
);

export const RocketIcon = ({ size = 22, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);