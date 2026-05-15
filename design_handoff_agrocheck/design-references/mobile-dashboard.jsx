/* Mobile · Dashboard / Statistika screen */

const MobileDashboard = () => {
  const t = DT.UZ;
  return (
    <PhoneFrame>
      <div style={{ position:'absolute', inset: 0, paddingTop: 50, paddingBottom: 90, display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ padding:'10px 22px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 11, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.10em' }}>{t.breadcrumb}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize: 26, letterSpacing:'-0.02em', marginTop: 2 }}>{t.title}</div>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: 10, border:'1px solid var(--line)', background:'#fff', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY:'auto', padding:'0 18px' }}>
          {/* Range segmented */}
          <div style={{
            display:'flex', gap: 4, padding: 3, borderRadius: 10,
            background:'#fff', border:'1px solid var(--line)', marginBottom: 14
          }}>
            {[t.range7, t.range30, t.range90, t.rangeYear].map((label, i) => (
              <button key={i} style={{
                flex: 1, padding:'8px 0', borderRadius: 8, border:'none', cursor:'pointer',
                background: i === 1 ? 'var(--primary)' : 'transparent',
                color: i === 1 ? '#fff' : 'var(--muted)',
                fontFamily:'var(--mono)', fontSize: 11, fontWeight: 500, letterSpacing:'0.04em'
              }}>{label}</button>
            ))}
          </div>

          {/* KPI 2x2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 14 }}>
            <MKpi label={t.kpiTotal}     value="142" change="+12%" up sparkColor="#0a3d2e" sparkData={sparkSamples.total}/>
            <MKpi label={t.kpiThisMonth} value="24"  change="+8" up sparkColor="#d4a017" sparkData={sparkSamples.month}/>
            <MKpi label={t.kpiHealthy}   value="38%" change="-4%" sparkColor="#84cc16" sparkData={sparkSamples.healthy}/>
            <MKpi label={t.kpiAccuracy}  value="94.2%" change="+1.1%" up sparkColor="#1f8a5b" sparkData={sparkSamples.acc}/>
          </div>

          {/* Streak card */}
          <div style={{
            background:'linear-gradient(155deg, #0a3d2e, #06291a)', color:'#fff',
            borderRadius: 16, padding: 14, position:'relative', overflow:'hidden', marginBottom: 14
          }}>
            <div style={{
              position:'absolute', inset:'auto -40px -60px auto', width: 160, height: 160, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(212,160,23,0.4), transparent 60%)', filter:'blur(20px)'
            }}/>
            <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.10em' }}>
                  {t.streak}
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap: 5, marginTop: 4 }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize: 36, letterSpacing:'-0.02em', lineHeight: 1 }}>12</span>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize: 12 }}>{t.days}</span>
                </div>
                <div style={{ fontSize: 10, color:'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  {t.longestStreak}: 28 {t.days}
                </div>
              </div>
              <div style={{ display:'flex', gap: 4 }}>
                {[1,1,1,1,1,1,0].map((on, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: 4,
                    background: on ? 'var(--accent)' : 'rgba(255,255,255,0.10)'
                  }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Trend card */}
          <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 14, marginBottom: 14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600 }}>{t.chartTitle}</h3>
                <div style={{ fontSize: 10, color:'var(--muted)', marginTop: 2 }}>{t.chartSub}</div>
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--primary)', fontWeight: 600 }}>↑ 12%</div>
            </div>
            <TrendChart lang="UZ"/>
          </div>

          {/* Donut card */}
          <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600 }}>{t.diseasesTitle}</h3>
              <div style={{ fontSize: 10, color:'var(--muted)', marginTop: 2 }}>{t.diseasesSub}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
              <DonutChart data={diseaseDistribution} size={130} thickness={20}/>
              <div style={{ flex: 1, display:'flex', flexDirection:'column', gap: 6, minWidth: 0 }}>
                {diseaseDistribution.slice(0, 5).map((d, i) => {
                  const total = diseaseDistribution.reduce((s, x) => s + x.value, 0);
                  const pct = Math.round((d.value / total) * 100);
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap: 6, fontSize: 11 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.uz}</span>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--muted)', fontSize: 10 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Plant types compact */}
          <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 14 }}>
            <h3 style={{ margin: '0 0 12px', fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600 }}>{t.plantsTitle}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {plantTypes.slice(0,4).map((p, i) => {
                const healthyPct = (p.healthy / p.count) * 100;
                return (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'80px 1fr 32px', gap: 8, alignItems:'center' }}>
                    <div style={{ fontSize: 12, color:'var(--ink)', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ display:'flex', height: 6, borderRadius: 3, overflow:'hidden', background:'rgba(212,160,23,0.18)' }}>
                      <div style={{ width: healthyPct + '%', background:'var(--primary)' }}/>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, textAlign:'right' }}>{p.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <MobileTabbar active="stats"/>
      </div>
    </PhoneFrame>
  );
};

const MKpi = ({ label, value, change, up, sparkData, sparkColor }) => (
  <div style={{
    background:'#fff', borderRadius: 12, border:'1px solid var(--line)', padding: 12,
    position:'relative', overflow:'hidden'
  }}>
    <div style={{ fontSize: 9, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.10em' }}>
      {label}
    </div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop: 6 }}>
      <div>
        <div style={{ fontFamily:'var(--serif)', fontSize: 24, letterSpacing:'-0.02em', lineHeight: 1 }}>{value}</div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 3, marginTop: 5,
          fontSize: 10, color: up ? '#1f8a5b' : '#b91c1c', fontWeight: 600
        }}>
          <span>{up ? '↑' : '↓'}</span>{change}
        </div>
      </div>
      {sparkData && <Sparkline data={sparkData} color={sparkColor} width={50} height={22}/>}
    </div>
  </div>
);

window.MobileDashboard = MobileDashboard;
