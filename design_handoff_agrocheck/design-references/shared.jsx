/* Shared brand and form atoms for Agrocheck auth variants */

const Logo = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    {/* leaf with circuit node */}
    <path d="M16 3c-7 0-12 5-12 12 0 7 5 14 12 14s12-7 12-14c0-7-5-12-12-12Z" stroke={color} strokeWidth="1.6"/>
    <path d="M16 7v22M9 13c2 .5 4.5.5 7 0M9 20c2 .5 4.5.5 7 0M23 13c-2 .5-4.5.5-7 0M23 20c-2 .5-4.5.5-7 0" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="2.2" fill={color}/>
  </svg>
);

const Wordmark = ({ color = 'currentColor', size = 18 }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap: 8, color,
    fontFamily:'var(--sans)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: size
  }}>
    <Logo size={size + 6} color={color} />
    <span>Agrocheck</span>
  </span>
);

const LangSwitch = ({ value = 'UZ', onChange = () => {}, tone = 'dark' }) => {
  const isDark = tone === 'dark';
  const base = {
    display:'inline-flex', padding: 3, borderRadius: 999,
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,31,21,0.05)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(10,31,21,0.08)',
    fontFamily:'var(--mono)', fontSize: 11, letterSpacing:'0.04em',
  };
  const opt = (label) => ({
    padding: '5px 10px', borderRadius: 999, cursor:'pointer',
    background: value === label ? (isDark ? '#fff' : 'var(--primary)') : 'transparent',
    color: value === label ? (isDark ? 'var(--primary)' : '#fff') : (isDark ? 'rgba(255,255,255,0.7)' : 'var(--muted)'),
    transition: 'all .15s ease',
  });
  return (
    <div style={base}>
      <div style={opt('UZ')} onClick={() => onChange('UZ')}>UZ</div>
      <div style={opt('EN')} onClick={() => onChange('EN')}>EN</div>
    </div>
  );
};

/* Text dictionary */
const T = {
  UZ: {
    welcomeBack: 'Xush kelibsiz',
    signIn: 'Tizimga kirish',
    signInSub: 'Hisobingizga kirib o\'simlik kasalliklarini aniqlashda davom eting',
    createAccount: 'Hisob yaratish',
    createSub: 'Bir necha soniyada ro\'yxatdan o\'ting va birinchi tahlilni boshlang',
    email: 'Email manzil',
    password: 'Parol',
    fullName: 'To\'liq ism',
    phone: 'Telefon raqam',
    forgot: 'Parolni unutdingizmi?',
    rememberMe: 'Meni eslab qol',
    or: 'yoki',
    continueGoogle: 'Google bilan davom etish',
    continueTelegram: 'Telegram bilan davom etish',
    haveAccount: 'Hisobingiz bormi?',
    noAccount: 'Hisobingiz yo\'qmi?',
    signUp: 'Ro\'yxatdan o\'tish',
    agree1: 'Ro\'yxatdan o\'tish orqali',
    agree2: 'foydalanish shartlari',
    agree3: 'va',
    agree4: 'maxfiylik siyosati',
    agree5: 'ga roziman',
    aiBadge: 'AI bilan ishlaydi',
    tagline: 'Bargdagi kasallikni 3 soniyada aniqlang',
    sub1: 'Suratga oling — sun\'iy intellekt qolganini bajaradi',
    metric1: 'Aniqlangan kasalliklar',
    metric2: 'Faol foydalanuvchilar',
    metric3: 'Aniqlik darajasi',
    poweredBy: 'Qwen 3.5 — 4B plantdisease modeli asosida',
    welcomeHero: 'Salomat ekin\nsalomat hosil',
    heroSub: 'Telefon kamerangiz orqali o\'simlik bargini suratga oling. AI kasallikni aniqlab, davolash yo\'lini ko\'rsatib beradi.',
  },
  EN: {
    welcomeBack: 'Welcome back',
    signIn: 'Sign in',
    signInSub: 'Log in to continue diagnosing plant diseases',
    createAccount: 'Create an account',
    createSub: 'Sign up in seconds and run your first analysis',
    email: 'Email address',
    password: 'Password',
    fullName: 'Full name',
    phone: 'Phone number',
    forgot: 'Forgot password?',
    rememberMe: 'Remember me',
    or: 'or',
    continueGoogle: 'Continue with Google',
    continueTelegram: 'Continue with Telegram',
    haveAccount: 'Already have an account?',
    noAccount: 'No account yet?',
    signUp: 'Sign up',
    agree1: 'By signing up you agree to our',
    agree2: 'terms of service',
    agree3: 'and',
    agree4: 'privacy policy',
    agree5: '',
    aiBadge: 'AI-powered',
    tagline: 'Detect leaf disease in 3 seconds',
    sub1: 'Snap a photo — let our AI handle the rest',
    metric1: 'Diseases detected',
    metric2: 'Active users',
    metric3: 'Accuracy rate',
    poweredBy: 'Powered by Qwen 3.5 — 4B plantdisease model',
    welcomeHero: 'Healthy crops,\nhealthy harvest',
    heroSub: 'Photograph a leaf with your phone camera. Our AI identifies the disease and shows you how to treat it.',
  }
};

/* Form inputs (controlled but minimal) */
const Field = ({ label, type = 'text', placeholder, icon, tone = 'light', hint, value, onChange, autoFocus }) => {
  const [focus, setFocus] = React.useState(false);
  const dark = tone === 'dark';
  return (
    <label style={{ display:'block' }}>
      <div style={{
        fontSize: 12, fontWeight: 500, letterSpacing:'0.01em',
        color: dark ? 'rgba(255,255,255,0.7)' : 'var(--muted)',
        marginBottom: 6,
        fontFamily: 'var(--mono)', textTransform:'uppercase'
      }}>{label}</div>
      <div style={{
        position:'relative',
        display:'flex', alignItems:'center', gap: 10,
        background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
        border: `1px solid ${focus ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.14)' : 'var(--line)')}`,
        borderRadius: 12,
        padding: '0 14px',
        height: 50,
        transition: 'border-color .15s ease, box-shadow .15s ease',
        boxShadow: focus ? `0 0 0 4px ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(10,61,46,0.08)'}` : 'none',
      }}>
        {icon && <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)', display:'inline-flex' }}>{icon}</span>}
        <input
          type={type} placeholder={placeholder}
          value={value} onChange={onChange} autoFocus={autoFocus}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{
            flex: 1, border:'none', outline:'none', background:'transparent',
            fontFamily:'var(--sans)', fontSize: 15,
            color: dark ? '#fff' : 'var(--ink)',
            height: '100%',
          }}
        />
        {hint && <span style={{ color: dark?'rgba(255,255,255,0.4)':'var(--muted)', fontSize:12, fontFamily:'var(--mono)' }}>{hint}</span>}
      </div>
    </label>
  );
};

const IconMail = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>);
const IconLock = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>);
const IconUser = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>);
const IconPhone = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"/>
    <path fill="#FBBC04" d="M3.95 10.7a5.41 5.41 0 0 1 0-3.4V4.97H.98a9 9 0 0 0 0 8.06l2.97-2.33Z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"/>
  </svg>
);
const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path fill="#fff" d="M5.5 11.6 17 7.1c.6-.2 1.1.1 1 .9l-2 9.2c-.1.6-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-2.8 5.2-4.7c.2-.2 0-.3-.3-.1L8.6 13l-2.7-.8c-.6-.2-.6-.6.1-.9Z"/>
  </svg>
);

const Button = ({ children, variant = 'primary', tone = 'light', icon, ...rest }) => {
  const dark = tone === 'dark';
  const styles = {
    primary: { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
    accent:  { background: 'var(--accent)', color: '#1a1305', border: '1px solid var(--accent)' },
    ghost:   { background: dark ? 'rgba(255,255,255,0.08)' : '#fff', color: dark ? '#fff' : 'var(--ink)', border: `1px solid ${dark ? 'rgba(255,255,255,0.14)' : 'var(--line)'}` },
    outline: { background: 'transparent', color: dark ? '#fff' : 'var(--ink)', border: `1px solid ${dark ? 'rgba(255,255,255,0.25)' : 'var(--line-strong)'}` },
  }[variant];
  return (
    <button {...rest} style={{
      ...styles,
      height: 50, padding: '0 18px', borderRadius: 12,
      fontFamily:'var(--sans)', fontSize: 15, fontWeight: 600,
      cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 10,
      width: '100%', transition: 'transform .08s ease, filter .15s ease',
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}
    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

const Divider = ({ label, tone = 'light' }) => {
  const dark = tone === 'dark';
  const c = dark ? 'rgba(255,255,255,0.14)' : 'var(--line)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: c }} />
      <span style={{
        fontSize: 11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.12em',
        color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)'
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: c }} />
    </div>
  );
};

/* Tabs that flip between Login / Register inside any variant */
const ModeTabs = ({ mode, setMode, labels, tone = 'light' }) => {
  const dark = tone === 'dark';
  return (
    <div style={{
      display:'inline-flex', padding: 4,
      borderRadius: 999,
      background: dark ? 'rgba(255,255,255,0.06)' : 'var(--primary-soft)',
      border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,61,46,0.08)',
      width:'fit-content'
    }}>
      {['signin','signup'].map((m, i) => (
        <button key={m} onClick={() => setMode(m)} style={{
          padding: '8px 18px', borderRadius: 999, border:'none', cursor:'pointer',
          fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600,
          background: mode === m ? (dark ? '#fff' : 'var(--primary)') : 'transparent',
          color: mode === m ? (dark ? 'var(--primary)' : '#fff') : (dark ? 'rgba(255,255,255,0.7)' : 'var(--primary)'),
          transition: 'all .15s ease',
        }}>{labels[i]}</button>
      ))}
    </div>
  );
};

Object.assign(window, { Logo, Wordmark, LangSwitch, T, Field, Button, Divider, ModeTabs,
  IconMail, IconLock, IconUser, IconPhone, IconGoogle, IconTelegram });
