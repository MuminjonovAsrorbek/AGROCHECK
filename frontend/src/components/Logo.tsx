export function Logo({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 3c-7 0-12 5-12 12 0 7 5 14 12 14s12-7 12-14c0-7-5-12-12-12Z" stroke={color} strokeWidth="1.6"/>
      <path d="M16 7v22M9 13c2 .5 4.5.5 7 0M9 20c2 .5 4.5.5 7 0M23 13c-2 .5-4.5.5-7 0M23 20c-2 .5-4.5.5-7 0" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.2" fill={color}/>
    </svg>
  );
}

export function Wordmark({ color = "currentColor", size = 18 }: { color?: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color, fontFamily: "var(--sans)", fontWeight: 700, letterSpacing: "-0.02em", fontSize: size }}>
      <Logo size={size + 6} color={color} />
      <span>Agrocheck</span>
    </span>
  );
}
