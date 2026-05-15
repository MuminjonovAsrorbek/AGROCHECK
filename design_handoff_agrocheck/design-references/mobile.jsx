/* Mobile auth screens — 3 compact variants */

const MobileFrame = ({ children, label, accent = 'var(--primary)' }) => (
  <div style={{
    width: 390, height: 760, borderRadius: 44,
    background:'#0a1f15', padding: 14, position:'relative',
    boxShadow:'0 30px 80px -20px rgba(0,0,0,0.4), 0 0 0 2px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      position:'absolute', top: 24, left: '50%', transform:'translateX(-50%)',
      width: 110, height: 32, borderRadius: 999, background:'#000', zIndex: 5
    }}/>
    <div style={{
      width:'100%', height:'100%', borderRadius: 32, overflow:'hidden',
      background:'#fff', position:'relative'
    }}>
      {/* status bar */}
      <div style={{
        position:'absolute', top: 0, left: 0, right: 0, height: 44,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'0 28px', fontSize: 13, fontWeight: 600, zIndex: 4,
        color: label === 'V2' ? '#fff' : 'var(--ink)'
      }}>
        <span style={{ fontFamily:'var(--mono)' }}>9:41</span>
        <div style={{ display:'flex', gap: 6, alignItems:'center' }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="6" rx="0.5"/><rect x="8" y="3" width="3" height="8" rx="0.5"/><rect x="12" y="0" width="3" height="11" rx="0.5"/></svg>
          <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><path d="M7 0a8 8 0 0 0-7 4l1.5 1.4A6 6 0 0 1 7 3a6 6 0 0 1 5.5 2.4L14 4A8 8 0 0 0 7 0Zm0 4a4 4 0 0 0-3.5 2L5 7.5a2 2 0 0 1 2-1 2 2 0 0 1 2 1L10.5 6A4 4 0 0 0 7 4Zm0 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
          <div style={{ width: 24, height: 11, border:'1px solid currentColor', borderRadius: 3, padding: 1, opacity: 0.6 }}>
            <div style={{ width:'70%', height:'100%', background:'currentColor', borderRadius: 1 }}/>
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

/* Mobile Variant 1 — Split goes vertical: hero top, form below */
const MobileV1 = () => {
  const [mode, setMode] = React.useState('signin');
  const t = T.UZ;
  return (
    <MobileFrame label="V1">
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        <div style={{
          background:'linear-gradient(155deg, #0a3d2e 0%, #08321a 100%)',
          color:'#fff', padding:'60px 24px 28px',
          position:'relative', overflow:'hidden'
        }}>
          <div style={{
            position:'absolute', inset:'auto -50px -50px auto', width: 200, height: 200,
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(212,160,23,0.4), transparent 60%)', filter:'blur(10px)'
          }}/>
          <div style={{ position:'relative' }}>
            <Wordmark color="#fff" size={16}/>
            <h2 style={{ fontFamily:'var(--serif)', fontSize: 30, margin:'14px 0 0', lineHeight: 1.05, letterSpacing:'-0.02em' }}>
              {t.welcomeBack}
            </h2>
            <p style={{ margin:'6px 0 0', fontSize: 13, color:'rgba(255,255,255,0.7)' }}>{t.signInSub}</p>
          </div>
        </div>

        <div style={{ flex: 1, padding:'22px 24px', overflowY:'auto' }}>
          <ModeTabs mode={mode} setMode={setMode} labels={[t.signIn, t.signUp]}/>
          <div style={{ height: 18 }}/>
          <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
            {mode === 'signup' && <Field label={t.fullName} placeholder="Karim Yusupov" icon={<IconUser/>}/>}
            <Field label={t.email} type="email" placeholder="siz@example.com" icon={<IconMail/>}/>
            <Field label={t.password} type="password" placeholder="••••••••" icon={<IconLock/>}/>
            {mode === 'signin' && (
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <a href="#" style={{ fontSize: 13, color:'var(--primary)', fontWeight: 500, textDecoration:'none' }}>{t.forgot}</a>
              </div>
            )}
            <Button variant="primary">{mode === 'signup' ? t.signUp : t.signIn}</Button>
            <Divider label={t.or}/>
            <Button variant="ghost" icon={<IconGoogle/>}>{t.continueGoogle}</Button>
          </div>
        </div>
        <div style={{
          padding:'14px 24px 28px', textAlign:'center', fontSize: 13, color:'var(--muted)',
          borderTop:'1px solid var(--line)'
        }}>
          {mode==='signup' ? t.haveAccount : t.noAccount}{' '}
          <a href="#" onClick={e=>{e.preventDefault(); setMode(mode==='signup'?'signin':'signup');}}
            style={{ color:'var(--primary)', fontWeight: 600, textDecoration:'none' }}>
            {mode==='signup' ? t.signIn : t.signUp}
          </a>
        </div>
      </div>
    </MobileFrame>
  );
};

/* Mobile Variant 2 — Full-bleed AI gradient with floating card */
const MobileV2 = () => {
  const [mode, setMode] = React.useState('signin');
  const t = T.UZ;
  return (
    <MobileFrame label="V2">
      <div style={{ position:'relative', height:'100%' }}>
        <div style={{ position:'absolute', inset: 0, background:'#04150d' }}/>
        <div style={{
          position:'absolute', top:'-10%', left:'-10%', width:'80%', height:'70%',
          background:'radial-gradient(circle, rgba(132,204,22,0.4) 0%, transparent 60%)', filter:'blur(20px)'
        }}/>
        <div style={{
          position:'absolute', bottom:'-10%', right:'-20%', width:'90%', height:'60%',
          background:'radial-gradient(circle, rgba(212,160,23,0.30) 0%, transparent 60%)', filter:'blur(20px)'
        }}/>

        <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', padding:'56px 20px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:'#fff' }}>
            <Wordmark color="#fff" size={16}/>
            <LangSwitch tone="dark"/>
          </div>

          <div style={{ flex: 1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{
              padding: 22, borderRadius: 22,
              background:'rgba(255,255,255,0.94)', backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.6)',
              boxShadow:'0 30px 60px rgba(0,0,0,0.3)'
            }}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap: 6, padding:'4px 10px', borderRadius: 999,
                background:'var(--primary-soft)', color:'var(--primary)',
                fontSize: 10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 12
              }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--primary)' }}/>
                {t.aiBadge}
              </span>
              <h2 style={{ fontFamily:'var(--serif)', fontSize: 28, margin: 0, lineHeight: 1.05, letterSpacing:'-0.02em' }}>
                {mode==='signup' ? t.createAccount : t.welcomeBack}
              </h2>
              <p style={{ margin:'6px 0 16px', fontSize: 13, color:'var(--muted)', lineHeight: 1.5 }}>
                {mode==='signup' ? t.createSub : t.signInSub}
              </p>
              <ModeTabs mode={mode} setMode={setMode} labels={[t.signIn, t.signUp]}/>
              <div style={{ height: 14 }}/>
              <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
                <Field label={t.email} type="email" placeholder="siz@example.com" icon={<IconMail/>}/>
                <Field label={t.password} type="password" placeholder="••••••••" icon={<IconLock/>}/>
                <Button variant="primary">{mode==='signup' ? t.signUp : t.signIn}</Button>
                <Button variant="ghost" icon={<IconGoogle/>}>{t.continueGoogle}</Button>
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize: 12, fontFamily:'var(--mono)' }}>
            {t.poweredBy}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

/* Mobile Variant 3 — Dark editorial */
const MobileV3 = () => {
  const [mode, setMode] = React.useState('signin');
  const t = T.UZ;
  return (
    <MobileFrame label="V3">
      <div style={{
        height:'100%', background:'#0a1f15', color:'#fff',
        padding:'56px 24px 24px', display:'flex', flexDirection:'column',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{
          position:'absolute', top:-60, right:-60, width: 200, height: 200, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,160,23,0.30), transparent 60%)', filter:'blur(20px)'
        }}/>

        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Wordmark color="#fff" size={15}/>
          <LangSwitch tone="dark"/>
        </div>

        <div style={{ position:'relative', marginTop: 28 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase' }}>
            {mode==='signup' ? '02 — Register' : '01 — Login'}
          </div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize: 38, lineHeight: 1.0, letterSpacing:'-0.03em', margin:'10px 0 8px' }}>
            {mode==='signup' ? t.createAccount : (
              <>Salomat ekin,<br/><span style={{ fontStyle:'italic', color:'var(--accent)' }}>salomat hosil</span></>
            )}
          </h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize: 13, margin:'6px 0 0', lineHeight: 1.5 }}>
            {mode==='signup' ? t.createSub : t.signInSub}
          </p>
        </div>

        <div style={{ position:'relative', flex: 1, marginTop: 24, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <ModeTabs mode={mode} setMode={setMode} labels={[t.signIn, t.signUp]} tone="dark"/>
          <div style={{ height: 16 }}/>
          <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
            {mode === 'signup' && <Field tone="dark" label={t.fullName} placeholder="Karim Yusupov" icon={<IconUser/>}/>}
            <Field tone="dark" label={t.email} type="email" placeholder="siz@example.com" icon={<IconMail/>}/>
            <Field tone="dark" label={t.password} type="password" placeholder="••••••••" icon={<IconLock/>}/>
            <Button variant="accent">{mode==='signup' ? t.signUp : t.signIn} →</Button>
            <Button variant="ghost" tone="dark" icon={<IconGoogle/>}>{t.continueGoogle}</Button>
          </div>
        </div>

        <div style={{
          position:'relative', textAlign:'center', fontSize: 12, color:'rgba(255,255,255,0.5)', marginTop: 18, paddingTop: 14,
          borderTop:'1px solid rgba(255,255,255,0.08)'
        }}>
          {mode==='signup' ? t.haveAccount : t.noAccount}{' '}
          <a href="#" onClick={e=>{e.preventDefault(); setMode(mode==='signup'?'signin':'signup');}}
            style={{ color:'var(--accent)', fontWeight: 600, textDecoration:'none' }}>
            {mode==='signup' ? t.signIn : t.signUp}
          </a>
        </div>
      </div>
    </MobileFrame>
  );
};

window.MobileV1 = MobileV1;
window.MobileV2 = MobileV2;
window.MobileV3 = MobileV3;
