/* Mobile · History screen */

const MobileHistory = () => {
  const [filter, setFilter] = React.useState('all');
  const t = HT.UZ;

  const filtered = historyData.filter(it => {
    if (filter === 'healthy' && it.status !== 'ok') return false;
    if (filter === 'diseased' && (it.status === 'ok' || it.status === 'lowconf')) return false;
    if (filter === 'lowconf' && it.status !== 'lowconf') return false;
    return true;
  });
  const grouped = {};
  filtered.forEach(it => { if (!grouped[it.date]) grouped[it.date] = []; grouped[it.date].push(it); });

  return (
    <PhoneFrame>
      <div style={{ position:'absolute', inset: 0, paddingTop: 50, paddingBottom: 90, display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ padding:'10px 22px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 11, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.10em' }}>{t.breadcrumb}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize: 26, letterSpacing:'-0.02em', marginTop: 2 }}>{t.title}</div>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 10, border:'1px solid var(--line)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </div>

        {/* Filter chips — horizontally scrollable */}
        <div style={{
          padding:'0 18px 12px', display:'flex', gap: 6, overflowX:'auto',
          scrollbarWidth:'none'
        }}>
          {[
            { k:'all',      label: t.filterAll,      color:'#0a3d2e' },
            { k:'healthy',  label: t.filterHealthy,  color:'#1f8a5b' },
            { k:'diseased', label: t.filterDiseased, color:'#d4a017' },
            { k:'lowconf',  label: t.filterLowConf,  color:'#9ca3af' },
          ].map(f => {
            const active = filter === f.k;
            return (
              <button key={f.k} onClick={()=>setFilter(f.k)} style={{
                display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
                padding:'7px 12px', borderRadius: 999, cursor:'pointer',
                background: active ? 'var(--primary)' : '#fff',
                color: active ? '#fff' : 'var(--ink-2)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500
              }}>
                <span style={{ width: 6, height: 6, borderRadius:'50%', background: active ? '#84cc16' : f.color }}/>
                {f.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY:'auto', padding:'0 18px' }}>
          {groupOrder.map(g => grouped[g] ? (
            <div key={g} style={{ marginBottom: 18 }}>
              <div style={{
                display:'flex', alignItems:'baseline', gap: 8, marginBottom: 8, padding:'0 2px'
              }}>
                <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600 }}>{groupTitle(g, t)}</h3>
                <span style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>· {grouped[g].length}</span>
                <div style={{ flex: 1, height: 1, background:'var(--line)', marginLeft: 6 }}/>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                {grouped[g].map(it => <MobileHistoryRow key={it.id} item={it}/>)}
              </div>
            </div>
          ) : null)}
        </div>

        <MobileTabbar active="history"/>
      </div>
    </PhoneFrame>
  );
};

const MobileHistoryRow = ({ item }) => {
  const s = statusMeta(item.status, 'UZ');
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'48px 1fr auto', gap: 10,
      alignItems:'center', padding: 10, borderRadius: 12,
      background:'#fff', border:'1px solid var(--line)'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, overflow:'hidden',
        background:'#0a3d2e', flexShrink: 0, position:'relative'
      }}>
        <LeafSample size={48} showSpots={item.status !== 'ok'}/>
        <span style={{
          position:'absolute', bottom: 3, right: 3,
          width: 8, height: 8, borderRadius:'50%',
          background: s.dot, border:'2px solid #fff'
        }}/>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color:'var(--ink)' }}>{item.plant}</span>
          <span style={{ fontFamily:'var(--mono)', fontSize: 9, color:'var(--muted)' }}>{item.id}</span>
        </div>
        <div style={{ fontSize: 11, color:'var(--ink-2)', marginTop: 2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {item.disease}
        </div>
        <div style={{ fontSize: 10, color:'var(--muted)', fontFamily:'var(--mono)', marginTop: 3 }}>
          {item.time}
        </div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{
          fontFamily:'var(--mono)', fontSize: 12, fontWeight: 700,
          color: item.status === 'ok' ? 'var(--primary)' : item.status === 'lowconf' ? 'var(--muted)' : 'var(--accent)'
        }}>{item.conf}%</div>
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 4,
          padding:'2px 6px', borderRadius: 4, marginTop: 3,
          background: s.bg, color: s.fg,
          fontSize: 9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em'
        }}>{s.label}</span>
      </div>
    </div>
  );
};

window.MobileHistory = MobileHistory;
