/* Mobile upload + analyzing + result screens — V1 design language */

const PhoneFrame = ({ children, dark = false }) => (
  <div style={{
    width: 390, height: 760, borderRadius: 44,
    background:'#0a1f15', padding: 14, position:'relative',
    boxShadow:'0 30px 80px -20px rgba(0,0,0,0.4)'
  }}>
    <div style={{
      position:'absolute', top: 24, left:'50%', transform:'translateX(-50%)',
      width: 110, height: 32, borderRadius: 999, background:'#000', zIndex: 5
    }}/>
    <div style={{
      width:'100%', height:'100%', borderRadius: 32, overflow:'hidden',
      background: dark ? '#0a3d2e' : '#fafaf7', position:'relative'
    }}>
      <div style={{
        position:'absolute', top: 0, left: 0, right: 0, height: 44,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'0 28px', fontSize: 13, fontWeight: 600, zIndex: 4,
        color: dark ? '#fff' : 'var(--ink)'
      }}>
        <span style={{ fontFamily:'var(--mono)' }}>9:41</span>
        <div style={{ display:'flex', gap: 6, alignItems:'center' }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="6" rx="0.5"/><rect x="8" y="3" width="3" height="8" rx="0.5"/><rect x="12" y="0" width="3" height="11" rx="0.5"/></svg>
          <div style={{ width: 24, height: 11, border:'1px solid currentColor', borderRadius: 3, padding: 1, opacity: 0.6 }}>
            <div style={{ width:'70%', height:'100%', background:'currentColor', borderRadius: 1 }}/>
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const MobileTabbar = ({ active = 'scan' }) => {
  const items = [
    { key:'home',    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12 12 3l9 9v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>) },
    { key:'history', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/></svg>) },
    { key:'scan',    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M7 12h10"/></svg>), primary: true },
    { key:'stats',   icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21V9M9 21V3M15 21v-7M21 21V12"/></svg>) },
    { key:'profile', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>) },
  ];
  return (
    <nav style={{
      position:'absolute', bottom: 0, left: 0, right: 0,
      padding:'12px 18px 24px',
      background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)',
      borderTop:'1px solid var(--line)',
      display:'flex', justifyContent:'space-around', alignItems:'center',
      zIndex: 5
    }}>
      {items.map(it => {
        const isActive = active === it.key;
        if (it.primary) {
          return (
            <button key={it.key} style={{
              width: 54, height: 54, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'var(--primary)', color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 12px 24px -8px rgba(10,61,46,0.4), 0 0 0 6px rgba(10,61,46,0.06)',
              marginTop: -16
            }}>{it.icon}</button>
          );
        }
        return (
          <button key={it.key} style={{
            width: 44, height: 44, borderRadius: 12, border:'none', cursor:'pointer',
            background:'transparent', color: isActive ? 'var(--primary)' : 'var(--muted)',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>{it.icon}</button>
        );
      })}
    </nav>
  );
};

/* Mobile · Upload */
const MobileUpload = () => {
  const lang = 'UZ';
  const t = UT[lang];
  return (
    <PhoneFrame>
      <div style={{ position:'absolute', inset: 0, paddingTop: 50, paddingBottom: 90, display:'flex', flexDirection:'column' }}>
        {/* greeting header */}
        <div style={{ padding:'8px 22px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 12, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Salom 👋</div>
            <div style={{ fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.02em', marginTop: 2 }}>Karim</div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius:'50%',
            background:'linear-gradient(135deg, #d4a017, #84cc16)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight: 700, color:'#0a3d2e', fontSize: 14
          }}>KY</div>
        </div>

        <div style={{ padding:'0 18px', flex: 1, overflowY:'auto' }}>
          {/* Big upload card */}
          <div style={{
            borderRadius: 22, padding: 22,
            background:'linear-gradient(155deg, #0a3d2e, #06291a)',
            color:'#fff', position:'relative', overflow:'hidden'
          }}>
            <div style={{
              position:'absolute', inset:'auto -40px -60px auto', width: 200, height: 200,
              borderRadius:'50%',
              background:'radial-gradient(circle, rgba(212,160,23,0.4), transparent 60%)', filter:'blur(20px)'
            }}/>
            <span style={{
              position:'relative', display:'inline-flex', alignItems:'center', gap: 6,
              padding:'3px 8px', borderRadius: 999,
              background:'rgba(132,204,22,0.18)', color:'#bef264',
              fontSize: 10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 14
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#84cc16' }}/>
              AI Scanner
            </span>
            <h2 style={{ position:'relative', margin: 0, fontFamily:'var(--serif)', fontSize: 26, lineHeight: 1.1, letterSpacing:'-0.02em' }}>
              Barg rasmini yuklang
            </h2>
            <p style={{ position:'relative', margin:'6px 0 16px', fontSize: 13, color:'rgba(255,255,255,0.7)' }}>
              AI 3 soniyada kasallikni aniqlaydi
            </p>
            <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
              <button style={{
                height: 48, borderRadius: 12, border:'none', cursor:'pointer',
                background:'var(--accent)', color:'#1a1305',
                fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600,
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Kamera
              </button>
              <button style={{
                height: 48, borderRadius: 12, cursor:'pointer',
                background:'rgba(255,255,255,0.10)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)',
                fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600,
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v15"/></svg>
                Galereya
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
            {[
              { v: '24', l: 'Bu oy' },
              { v: '142', l: 'Jami' },
              { v: '97%', l: 'Aniqlik' },
            ].map((x, i) => (
              <div key={i} style={{
                background:'#fff', borderRadius: 14, border:'1px solid var(--line)', padding: 12
              }}>
                <div style={{ fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.02em', lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 10, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop: 4 }}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 18, marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600 }}>Oxirgi tahlillar</h3>
            <a href="#" style={{ fontSize: 12, color:'var(--primary)', textDecoration:'none', fontWeight: 500 }}>Hammasi</a>
          </div>

          {[
            { name:'Pomidor bargi', tag:'Early Blight', time:'2 soat oldin', conf: 97, status:'warn' },
            { name:'Bodring', tag:'Sog\'lom', time:'5 soat oldin', conf: 99, status:'ok' },
            { name:'Olma bargi', tag:'Cedar Rust', time:'Kecha', conf: 92, status:'warn' },
          ].map((it, i) => {
            const color = it.status === 'ok' ? '#0a3d2e' : '#d4a017';
            const bg    = it.status === 'ok' ? 'rgba(10,61,46,0.06)' : 'rgba(212,160,23,0.10)';
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 10, padding: 10,
                background:'#fff', borderRadius: 14, border:'1px solid var(--line)', marginBottom: 8
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow:'hidden', background:'#0a3d2e' }}>
                  <LeafSample size={44} showSpots={it.status !== 'ok'}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color:'var(--ink)' }}>{it.name}</div>
                  <div style={{ display:'flex', gap: 6, alignItems:'center', marginTop: 2 }}>
                    <span style={{
                      fontSize: 10, fontFamily:'var(--mono)', padding:'2px 6px', borderRadius: 4,
                      background: bg, color
                    }}>{it.tag}</span>
                    <span style={{ fontSize: 10, color:'var(--muted)' }}>{it.time}</span>
                  </div>
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize: 12, color, fontWeight: 600 }}>{it.conf}%</div>
              </div>
            );
          })}
        </div>

        <MobileTabbar active="home"/>
      </div>
    </PhoneFrame>
  );
};

/* Mobile · Analyzing */
const MobileAnalyzing = () => {
  return (
    <PhoneFrame>
      <div style={{ position:'absolute', inset: 0, paddingTop: 50, display:'flex', flexDirection:'column', background:'linear-gradient(180deg, #0a3d2e 0%, #06291a 100%)', color:'#fff' }}>
        <div style={{ padding:'10px 22px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.10)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Tahlil</div>
          <button style={{ width: 36, height: 36, borderRadius: 10, background:'transparent', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
          </button>
        </div>

        {/* image area */}
        <div style={{ position:'relative', margin:'0 22px', aspectRatio:'4/5', borderRadius: 20, overflow:'hidden', background:'#0a3d2e' }}>
          {[
            { top: 12, left: 12 }, { top: 12, right: 12 },
            { bottom: 12, left: 12 }, { bottom: 12, right: 12 }
          ].map((p, i) => (
            <div key={i} style={{
              position:'absolute', width: 24, height: 24,
              borderTop: i < 2 ? '2px solid var(--accent)' : 'none',
              borderBottom: i >= 2 ? '2px solid var(--accent)' : 'none',
              borderLeft: (i % 2 === 0) ? '2px solid var(--accent)' : 'none',
              borderRight: (i % 2 === 1) ? '2px solid var(--accent)' : 'none',
              ...p
            }}/>
          ))}
          <div style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <LeafSample size={280} showSpots/>
          </div>
          <div className="scanline-m" style={{
            position:'absolute', left: 16, right: 16, height: 2,
            background:'linear-gradient(90deg, transparent, var(--accent), transparent)',
            boxShadow:'0 0 20px var(--accent)',
            animation:'scanmove 2.4s ease-in-out infinite'
          }}/>
          <div style={{
            position:'absolute', top: 16, left:'50%', transform:'translateX(-50%)',
            padding:'5px 12px', borderRadius: 999,
            background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.10)',
            fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.12em', textTransform:'uppercase',
            display:'inline-flex', alignItems:'center', gap: 8
          }}>
            <span style={{ width: 5, height: 5, borderRadius:'50%', background:'#84cc16', animation:'pulse 1s ease-in-out infinite' }}/>
            Scanning
          </div>
        </div>

        <div style={{ padding:'24px 22px', flex: 1, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <h2 style={{ margin: 0, fontFamily:'var(--serif)', fontSize: 30, lineHeight: 1.05, letterSpacing:'-0.02em' }}>
            AI tahlil qilmoqda…
          </h2>
          <p style={{ margin:'6px 0 18px', color:'rgba(255,255,255,0.65)', fontSize: 13 }}>
            Qwen 3.5 modeli ishlamoqda
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            {[
              { label:'Tasvirni qayta ishlash', done: true },
              { label:'Xususiyatlarni ajratish', done: true },
              { label:'Klassifikatsiya', active: true },
              { label:'Davolash tavsiyalari', done: false }
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius:'50%', flexShrink: 0,
                  background: s.done ? 'var(--accent)' : 'transparent',
                  border: s.done ? 'none' : `1.5px solid ${s.active ? 'var(--accent)' : 'rgba(255,255,255,0.20)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#1a1305', fontFamily:'var(--mono)', fontSize: 10, fontWeight: 600
                }}>
                  {s.done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5 9-9"/></svg> :
                    s.active ? <span style={{ width: 7, height: 7, borderRadius:'50%', background:'var(--accent)', animation:'pulse 1s ease-in-out infinite' }}/> : null}
                </div>
                <div style={{ fontSize: 13, color: (s.done || s.active) ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: s.active ? 600 : 400 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

/* Mobile · Result */
const MobileResult = () => {
  return (
    <PhoneFrame>
      <div style={{ position:'absolute', inset: 0, paddingTop: 50, paddingBottom: 90, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'10px 22px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, background:'#fff', border:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Natija</div>
          <button style={{ width: 36, height: 36, borderRadius: 10, background:'#fff', border:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY:'auto', padding:'0 18px' }}>
          {/* Image with detected info (clean — no fake bounding boxes) */}
          <div style={{ position:'relative', borderRadius: 18, overflow:'hidden', background:'#0a3d2e', aspectRatio:'4/3' }}>
            <div style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LeafSample size={240} showSpots/>
            </div>
            <div style={{
              position:'absolute', inset: 0,
              background:'radial-gradient(circle at 50% 50%, rgba(132,204,22,0.10), transparent 65%)'
            }}/>
            {/* corner brackets */}
            {[
              { top: 10, left: 10 }, { top: 10, right: 10 },
              { bottom: 10, left: 10 }, { bottom: 10, right: 10 }
            ].map((p, i) => (
              <div key={i} style={{
                position:'absolute', width: 18, height: 18,
                borderTop:    i < 2  ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderBottom: i >= 2 ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderLeft:   (i % 2 === 0) ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderRight:  (i % 2 === 1) ? '2px solid rgba(255,255,255,0.4)' : 'none',
                ...p
              }}/>
            ))}
            <div style={{
              position:'absolute', top: 10, left: 10,
              padding:'4px 8px', borderRadius: 6, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)',
              color:'#fff', fontFamily:'var(--mono)', fontSize: 9, letterSpacing:'0.08em', textTransform:'uppercase',
              border:'1px solid rgba(255,255,255,0.10)'
            }}>AI tahlil qildi</div>
            <div style={{
              position:'absolute', bottom: 10, left: 10, right: 10,
              display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              color:'#fff'
            }}>
              <div style={{
                background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
                padding:'8px 10px', borderRadius: 10, border:'1px solid rgba(255,255,255,0.10)'
              }}>
                <div style={{ fontFamily:'var(--mono)', fontSize: 9, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Aniqlandi</div>
                <div style={{ fontFamily:'var(--serif)', fontSize: 16, marginTop: 2 }}>Early Blight</div>
              </div>
              <div style={{
                background:'var(--accent)', color:'#1a1305',
                padding:'6px 12px', borderRadius: 10, fontFamily:'var(--mono)', fontWeight: 700, fontSize: 13
              }}>
                97.4%
              </div>
            </div>
          </div>

          {/* Disease title */}
          <div style={{ padding:'18px 4px 8px' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap: 5, padding:'3px 8px', borderRadius: 999,
              background:'rgba(212,160,23,0.14)', color:'#8a6610',
              fontSize: 10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 8
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)' }}/>
              Aniqlangan kasallik
            </span>
            <h2 style={{ margin: 0, fontFamily:'var(--serif)', fontSize: 26, lineHeight: 1.05, letterSpacing:'-0.02em' }}>
              Pomidor · Erta dog'lanish
            </h2>
            <div style={{ marginTop: 4, fontStyle:'italic', color:'var(--muted)', fontSize: 12 }}>Alternaria solani</div>
          </div>

          {/* Mini metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background:'#fff', borderRadius: 12, border:'1px solid var(--line)', padding: 12 }}>
              <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Ishonch</div>
              <div style={{ fontFamily:'var(--serif)', fontSize: 20, marginTop: 4, color:'var(--primary)', letterSpacing:'-0.01em' }}>97.4%</div>
              <div style={{ height: 3, background:'var(--line)', borderRadius: 2, marginTop: 8, overflow:'hidden' }}>
                <div style={{ width:'97%', height:'100%', background:'var(--primary)' }}/>
              </div>
            </div>
            <div style={{ background:'#fff', borderRadius: 12, border:'1px solid var(--line)', padding: 12 }}>
              <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Og'irlik</div>
              <div style={{ fontFamily:'var(--serif)', fontSize: 20, marginTop: 4, color:'#d4a017', letterSpacing:'-0.01em' }}>O'rta</div>
              <div style={{ height: 3, background:'var(--line)', borderRadius: 2, marginTop: 8, overflow:'hidden' }}>
                <div style={{ width:'50%', height:'100%', background:'#d4a017' }}/>
              </div>
            </div>
          </div>

          {/* Top-N predictions */}
          <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 14, marginBottom: 12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600 }}>Boshqa ehtimoliy variantlar</h3>
              <span style={{ fontSize: 9, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Model chiqishi</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {[
                { name:'Erta dog\'lanish', conf: 97.4, top: true },
                { name:'Kech dog\'lanish', conf: 1.8 },
                { name:'Septoria dog\'i', conf: 0.5 },
                { name:'Sog\'lom', conf: 0.3 },
              ].map((p, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 56px 38px', gap: 10, alignItems:'center' }}>
                  <div style={{ fontSize: 12, fontWeight: p.top ? 600 : 500, color: p.top ? 'var(--primary)' : 'var(--ink-2)', display:'flex', alignItems:'center', gap: 6 }}>
                    {p.top && <span style={{ width: 5, height: 5, borderRadius:'50%', background:'var(--primary)' }}/>}
                    {p.name}
                  </div>
                  <div style={{ height: 4, background:'var(--line)', borderRadius: 2, overflow:'hidden' }}>
                    <div style={{ width: Math.max(p.conf, 0.5)+'%', height:'100%', background: p.top ? 'var(--primary)' : i===1 ? 'var(--accent)' : 'var(--muted)' }}/>
                  </div>
                  <div style={{ fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, textAlign:'right', color: p.top ? 'var(--primary)' : 'var(--muted)' }}>{p.conf}%</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 12, paddingTop: 10, borderTop:'1px dashed var(--line)',
              fontSize: 10, color:'var(--muted)', lineHeight: 1.5, textWrap:'pretty'
            }}>
              AI butun rasmni klassifikatsiya qiladi — barg ustida aniq nuqtalarni belgilab bera olmaydi.
            </div>
          </div>

          {/* Treatment */}
          <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600 }}>Davolash usuli</h3>
              <span style={{
                fontSize: 9, fontFamily:'var(--mono)', color:'var(--primary)',
                textTransform:'uppercase', letterSpacing:'0.08em',
                padding:'3px 6px', borderRadius: 4, background:'var(--primary-soft)'
              }}>4 qadam</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {[
                'Zararlangan barglarni darhol kesib oling',
                'Mis-sulfat (1%) bilan har 7 kunda 2 marta sepish',
                'Sug\'orishni ildiz ostidan amalga oshiring',
                'Almashlab ekishni qo\'llang — 3 yil'
              ].map((s, i) => (
                <div key={i} style={{ display:'flex', gap: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius:'50%', flexShrink: 0,
                    background:'var(--primary-soft)', color:'var(--primary)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--mono)', fontSize: 10, fontWeight: 600
                  }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color:'var(--ink-2)', flex: 1, textWrap:'pretty' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap: 8, marginTop: 12 }}>
            <button style={{
              flex: 1, height: 46, borderRadius: 12, border:'none', cursor:'pointer',
              background:'var(--primary)', color:'#fff',
              fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6
            }}>
              PDF hisobot
            </button>
            <button style={{
              flex: 1, height: 46, borderRadius: 12, cursor:'pointer',
              background:'#fff', color:'var(--ink)', border:'1px solid var(--line-strong)',
              fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600
            }}>
              Yana tahlil
            </button>
          </div>
        </div>

        <MobileTabbar active="scan"/>
      </div>
    </PhoneFrame>
  );
};

window.MobileUpload = MobileUpload;
window.MobileAnalyzing = MobileAnalyzing;
window.MobileResult = MobileResult;
