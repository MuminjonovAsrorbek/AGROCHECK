/* Variant 1 — Split-screen: form left, brand dark panel right with AI viz */

const V1Brand = ({ lang }) => {
  const t = T[lang];
  return (
    <div style={{
      position:'relative', overflow:'hidden',
      background:'linear-gradient(155deg, #0a3d2e 0%, #08321a 55%, #051d11 100%)',
      color:'#fff', height:'100%',
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      padding: 44,
    }}>
      {/* ambient glow */}
      <div style={{
        position:'absolute', inset:'auto -120px -120px auto', width: 440, height: 440,
        borderRadius:'50%',
        background:'radial-gradient(circle at center, rgba(212,160,23,0.35), rgba(212,160,23,0) 60%)',
        filter:'blur(10px)', pointerEvents:'none'
      }}/>
      <div style={{
        position:'absolute', inset:'-160px auto auto -160px', width: 520, height: 520,
        borderRadius:'50%',
        background:'radial-gradient(circle at center, rgba(132,204,22,0.18), rgba(132,204,22,0) 60%)',
        filter:'blur(20px)', pointerEvents:'none'
      }}/>
      {/* grid pattern */}
      <svg style={{ position:'absolute', inset: 0, width:'100%', height:'100%', opacity:0.06 }}>
        <defs>
          <pattern id="g1" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" stroke="#fff" strokeWidth="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)"/>
      </svg>

      <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Wordmark color="#fff" size={20} />
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 8,
          padding:'6px 12px', borderRadius: 999,
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)',
          fontSize: 11, fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase'
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#84cc16', boxShadow:'0 0 12px #84cc16' }}/>
          {t.aiBadge}
        </span>
      </div>

      {/* AI visualization card */}
      <div style={{ position:'relative', display:'flex', flexDirection:'column', gap: 18 }}>
        <V1ScanCard lang={lang} />
        <div>
          <div style={{
            fontFamily:'var(--serif)', fontSize: 44, lineHeight: 1.05, letterSpacing:'-0.02em',
            color:'#fff', maxWidth: 460
          }}>
            {t.tagline}
          </div>
          <div style={{ color:'rgba(255,255,255,0.65)', fontSize: 15, marginTop: 12, maxWidth: 420, lineHeight: 1.5 }}>
            {t.sub1}
          </div>
        </div>
      </div>

      <div style={{ position:'relative', display:'flex', gap: 28 }}>
        {[
          { v: '142K', l: T[lang].metric1 },
          { v: '38K',  l: T[lang].metric2 },
          { v: '97.4%', l: T[lang].metric3 },
        ].map(m => (
          <div key={m.l}>
            <div style={{
              fontFamily:'var(--serif)', fontSize: 28, color:'var(--accent)', letterSpacing:'-0.02em'
            }}>{m.v}</div>
            <div style={{ fontSize: 12, color:'rgba(255,255,255,0.55)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop: 2 }}>
              {m.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const V1ScanCard = ({ lang }) => (
  <div style={{
    width: 320, padding: 14,
    borderRadius: 18, background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(255,255,255,0.10)', backdropFilter:'blur(8px)',
    boxShadow:'0 20px 60px rgba(0,0,0,0.35)'
  }}>
    <div style={{
      position:'relative', height: 150, borderRadius: 12, overflow:'hidden',
      background:'linear-gradient(135deg, #1d4421, #0a3d2e)',
    }}>
      {/* placeholder striped leaf */}
      <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset: 0, width:'100%', height:'100%' }}>
        <defs>
          <pattern id="leaf-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="#84cc16" opacity="0.32"/>
            <rect x="3" width="3" height="6" fill="#84cc16" opacity="0.18"/>
          </pattern>
        </defs>
        <ellipse cx="160" cy="75" rx="120" ry="50" fill="url(#leaf-stripes)"/>
        <path d="M40 75 Q160 30 280 75 Q160 120 40 75 Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
        {/* scan line */}
        <line x1="40" y1="50" x2="280" y2="50" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3"/>
        {/* detected spot */}
        <circle cx="200" cy="65" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
        <circle cx="200" cy="65" r="3" fill="#fbbf24"/>
      </svg>
      <div style={{
        position:'absolute', top: 10, left: 10,
        padding:'4px 8px', borderRadius: 6, background:'rgba(0,0,0,0.4)',
        fontSize: 10, fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase',
      }}>SCAN · 03</div>
      <div style={{
        position:'absolute', bottom: 10, right: 10,
        padding:'4px 8px', borderRadius: 6, background:'rgba(212,160,23,0.9)', color:'#1a1305',
        fontSize: 10, fontFamily:'var(--mono)', fontWeight: 600
      }}>97.4% match</div>
    </div>
    <div style={{ padding: '12px 4px 4px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
      <div>
        <div style={{ fontSize: 11, color:'rgba(255,255,255,0.5)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
          Detected
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Tomato leaf · Early Blight</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius:'50%',
        background:'rgba(132,204,22,0.18)', display:'flex', alignItems:'center', justifyContent:'center',
        border: '1px solid rgba(132,204,22,0.35)'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2.5">
          <path d="M5 12l5 5 9-9"/>
        </svg>
      </div>
    </div>
  </div>
);

const V1Form = ({ mode, setMode, lang, setLang }) => {
  const t = T[lang];
  const isSignup = mode === 'signup';
  return (
    <div style={{
      background:'#fff', height:'100%',
      display:'flex', flexDirection:'column',
      padding: 44
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <ModeTabs mode={mode} setMode={setMode}
          labels={[t.signIn, t.signUp]} />
        <LangSwitch value={lang} onChange={setLang} tone="light" />
      </div>

      <div style={{ flex: 1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth: 420, alignSelf:'center', width:'100%' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily:'var(--serif)', fontSize: 44, lineHeight: 1.05,
            margin: 0, letterSpacing:'-0.02em',
          }}>
            {isSignup ? t.createAccount : t.welcomeBack}
          </h1>
          <p style={{ margin:'10px 0 0', color:'var(--muted)', fontSize: 15, lineHeight: 1.5 }}>
            {isSignup ? t.createSub : t.signInSub}
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          {isSignup && <Field label={t.fullName} placeholder="Karim Yusupov" icon={<IconUser/>}/>}
          <Field label={t.email} type="email" placeholder="siz@example.com" icon={<IconMail/>}/>
          {isSignup && <Field label={t.phone} placeholder="+998 90 123 45 67" icon={<IconPhone/>}/>}
          <Field label={t.password} type="password" placeholder="••••••••" icon={<IconLock/>}/>

          {!isSignup && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: -2 }}>
              <label style={{ display:'inline-flex', alignItems:'center', gap: 8, fontSize: 13, color:'var(--muted)', cursor:'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor:'var(--primary)' }}/>
                {t.rememberMe}
              </label>
              <a href="#" style={{ fontSize: 13, color:'var(--primary)', textDecoration:'none', fontWeight: 500 }}>{t.forgot}</a>
            </div>
          )}

          <div style={{ marginTop: 6 }}>
            <Button variant="primary">{isSignup ? t.signUp : t.signIn}</Button>
          </div>

          <Divider label={t.or}/>

          <div style={{ display:'flex', gap: 10 }}>
            <Button variant="ghost" icon={<IconGoogle/>}>Google</Button>
            <Button variant="ghost" icon={<IconTelegram/>}>Telegram</Button>
          </div>

          {isSignup && (
            <p style={{ margin:'8px 0 0', fontSize: 12, color:'var(--muted)', textAlign:'center', lineHeight: 1.5 }}>
              {t.agree1} <a href="#" style={{ color:'var(--primary)' }}>{t.agree2}</a> {t.agree3} <a href="#" style={{ color:'var(--primary)' }}>{t.agree4}</a> {t.agree5}
            </p>
          )}
        </div>
      </div>

      <div style={{ textAlign:'center', fontSize: 14, color:'var(--muted)' }}>
        {isSignup ? t.haveAccount : t.noAccount}{' '}
        <a href="#" onClick={e=>{e.preventDefault(); setMode(isSignup?'signin':'signup');}}
          style={{ color:'var(--primary)', fontWeight: 600, textDecoration:'none' }}>
          {isSignup ? t.signIn : t.signUp}
        </a>
      </div>
    </div>
  );
};

const Variant1 = ({ defaultMode = 'signin', defaultLang = 'UZ' }) => {
  const [mode, setMode] = React.useState(defaultMode);
  const [lang, setLang] = React.useState(defaultLang);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', height: '100%', background:'#fff' }}>
      <V1Form mode={mode} setMode={setMode} lang={lang} setLang={setLang} />
      <V1Brand lang={lang} />
    </div>
  );
};

window.Variant1 = Variant1;
