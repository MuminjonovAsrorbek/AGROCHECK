/* History / Tarix screen — V1 design language */

const HT = {
  UZ: {
    title: 'Tarix',
    breadcrumb: 'Bosh sahifa · Tarix',
    search: 'Tahlil yoki o\'simlik qidirish…',
    export: 'Eksport',
    filterAll: 'Hammasi',
    filterHealthy: 'Sog\'lom',
    filterDiseased: 'Kasallangan',
    filterLowConf: 'Past ishonch',
    plant: 'O\'simlik',
    period: 'Davr',
    sortBy: 'Saralash',
    sortNewest: 'Yangidan',
    sortOldest: 'Eskidan',
    sortConfHigh: 'Yuqori ishonch',
    plantAll: 'Barcha o\'simliklar',
    period30: 'So\'nggi 30 kun',
    viewList: 'Ro\'yxat',
    viewGrid: 'Galereya',
    today: 'Bugun',
    yesterday: 'Kecha',
    thisWeek: 'Bu hafta',
    thisMonth: 'Bu oy',
    earlier: 'Avvalroq',
    selected: 'tanlandi',
    delete: 'O\'chirish',
    download: 'Yuklab olish',
    open: 'Ochish',
    healthy: 'Sog\'lom',
    summary: 'Jami 142 ta tahlil · 88 ta kasallangan · 54 ta sog\'lom',
    of: 'dan',
    showing: 'ko\'rsatilmoqda',
    location: 'Joylashuv',
    confidence: 'Ishonch',
    empty: 'Hech narsa topilmadi',
    emptySub: 'Filtrlarni o\'zgartirib ko\'ring',
  },
  EN: {
    title: 'History',
    breadcrumb: 'Home · History',
    search: 'Search scans or plants…',
    export: 'Export',
    filterAll: 'All',
    filterHealthy: 'Healthy',
    filterDiseased: 'Diseased',
    filterLowConf: 'Low confidence',
    plant: 'Plant',
    period: 'Period',
    sortBy: 'Sort',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortConfHigh: 'Highest conf.',
    plantAll: 'All plants',
    period30: 'Last 30 days',
    viewList: 'List',
    viewGrid: 'Gallery',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    thisMonth: 'This month',
    earlier: 'Earlier',
    selected: 'selected',
    delete: 'Delete',
    download: 'Download',
    open: 'Open',
    healthy: 'Healthy',
    summary: 'Total 142 scans · 88 diseased · 54 healthy',
    of: 'of', showing: 'showing',
    location: 'Location',
    confidence: 'Confidence',
    empty: 'Nothing found',
    emptySub: 'Try adjusting the filters',
  }
};

/* Mock data — 18 scans across groups */
const historyData = [
  // Today
  { id:'#1247', plant:'Pomidor', plantEn:'Tomato',   disease:'Erta dog\'lanish',  diseaseEn:'Early Blight',     conf: 97.4, status:'warn', time:'14:32', date:'today',     loc:'Toshkent · Yunusobod' },
  { id:'#1246', plant:'Bodring', plantEn:'Cucumber', disease:'Sog\'lom',           diseaseEn:'Healthy',          conf: 99.1, status:'ok',   time:'11:08', date:'today',     loc:'Toshkent · Yunusobod' },
  { id:'#1245', plant:'Pomidor', plantEn:'Tomato',   disease:'Sog\'lom',           diseaseEn:'Healthy',          conf: 96.0, status:'ok',   time:'09:42', date:'today',     loc:'Toshkent · Yunusobod' },

  // Yesterday
  { id:'#1244', plant:'Olma',     plantEn:'Apple',    disease:'Sarv zang',          diseaseEn:'Cedar Rust',       conf: 92.3, status:'warn', time:'18:55', date:'yesterday', loc:'Toshkent · Mirobod' },
  { id:'#1243', plant:'Uzum',     plantEn:'Grape',    disease:'Sog\'lom',           diseaseEn:'Healthy',          conf: 96.8, status:'ok',   time:'16:20', date:'yesterday', loc:'Toshkent · Mirobod' },
  { id:'#1242', plant:'Kartoshka',plantEn:'Potato',   disease:'Kech dog\'lanish',   diseaseEn:'Late Blight',      conf: 89.5, status:'bad',  time:'10:11', date:'yesterday', loc:'Samarqand' },
  { id:'#1241', plant:'Pomidor',  plantEn:'Tomato',   disease:'Septoria dog\'i',    diseaseEn:'Septoria Spot',    conf: 64.2, status:'lowconf', time:'08:33', date:'yesterday', loc:'Samarqand' },

  // This week
  { id:'#1240', plant:'Olma',     plantEn:'Apple',    disease:'Sarv zang',          diseaseEn:'Cedar Rust',       conf: 88.0, status:'warn', time:'12 May 19:04', date:'week', loc:'Toshkent · Sergeli' },
  { id:'#1239', plant:'Uzum',     plantEn:'Grape',    disease:'Kul rang chirish',   diseaseEn:'Powdery Mildew',   conf: 94.1, status:'warn', time:'11 May 17:22', date:'week', loc:'Toshkent · Sergeli' },
  { id:'#1238', plant:'Bodring',  plantEn:'Cucumber', disease:'Sog\'lom',           diseaseEn:'Healthy',          conf: 98.0, status:'ok',   time:'11 May 09:15', date:'week', loc:'Toshkent · Sergeli' },
  { id:'#1237', plant:'Pomidor',  plantEn:'Tomato',   disease:'Erta dog\'lanish',   diseaseEn:'Early Blight',     conf: 95.8, status:'warn', time:'10 May 16:48', date:'week', loc:'Farg\'ona' },

  // This month
  { id:'#1236', plant:'Kartoshka',plantEn:'Potato',   disease:'Kech dog\'lanish',   diseaseEn:'Late Blight',      conf: 91.4, status:'bad',  time:'8 May 14:10',  date:'month', loc:'Farg\'ona' },
  { id:'#1235', plant:'Olma',     plantEn:'Apple',    disease:'Sog\'lom',           diseaseEn:'Healthy',          conf: 97.2, status:'ok',   time:'6 May 11:55',  date:'month', loc:'Farg\'ona' },
  { id:'#1234', plant:'Pomidor',  plantEn:'Tomato',   disease:'Erta dog\'lanish',   diseaseEn:'Early Blight',     conf: 71.8, status:'lowconf', time:'5 May 13:08',  date:'month', loc:'Toshkent · Yunusobod' },
  { id:'#1233', plant:'Uzum',     plantEn:'Grape',    disease:'Septoria dog\'i',    diseaseEn:'Septoria Spot',    conf: 86.5, status:'warn', time:'3 May 18:42',  date:'month', loc:'Toshkent · Yunusobod' },
];

/* ─────────── Helpers ─────────── */
const statusMeta = (status, lang) => {
  if (status === 'ok')    return { fg:'#0a3d2e', bg:'rgba(10,61,46,0.06)',   dot:'#1f8a5b', label: lang==='UZ' ? 'Sog\'lom' : 'Healthy' };
  if (status === 'warn')  return { fg:'#8a6610', bg:'rgba(212,160,23,0.10)', dot:'#d4a017', label: lang==='UZ' ? 'O\'rta' : 'Moderate' };
  if (status === 'bad')   return { fg:'#b91c1c', bg:'rgba(185,28,28,0.08)',  dot:'#dc2626', label: lang==='UZ' ? 'Og\'ir' : 'Severe' };
  if (status === 'lowconf') return { fg:'#5b5045', bg:'rgba(91,80,69,0.08)', dot:'#9ca3af', label: lang==='UZ' ? 'Past ishonch' : 'Low conf.' };
  return { fg:'var(--ink)', bg:'#fff', dot:'#000', label:'' };
};

const groupOrder = ['today','yesterday','week','month'];
const groupTitle = (key, t) => ({
  today: t.today, yesterday: t.yesterday, week: t.thisWeek, month: t.thisMonth
})[key];

/* ─────────── History Screen ─────────── */
const HistoryScreen = ({ lang: initLang = 'UZ' }) => {
  const [lang, setLang] = React.useState(initLang);
  const [filter, setFilter] = React.useState('all');
  const [plant, setPlant] = React.useState('all');
  const [view, setView] = React.useState('list');
  const [selection, setSelection] = React.useState(new Set());
  const t = HT[lang];

  const filtered = historyData.filter(it => {
    if (filter === 'healthy' && it.status !== 'ok') return false;
    if (filter === 'diseased' && (it.status === 'ok' || it.status === 'lowconf')) return false;
    if (filter === 'lowconf' && it.status !== 'lowconf') return false;
    if (plant !== 'all' && it.plantEn.toLowerCase() !== plant) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(it => {
    if (!grouped[it.date]) grouped[it.date] = [];
    grouped[it.date].push(it);
  });

  const filterCounts = {
    all:      historyData.length,
    healthy:  historyData.filter(d => d.status === 'ok').length,
    diseased: historyData.filter(d => d.status === 'warn' || d.status === 'bad').length,
    lowconf:  historyData.filter(d => d.status === 'lowconf').length,
  };

  const toggleSel = (id) => {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelection(next);
  };

  return (
    <Shell active="history" title={t.title} breadcrumb={t.breadcrumb}
      lang={lang} setLang={setLang}
      rightSlot={
        <button style={{
          height: 40, padding:'0 14px', borderRadius: 10, border:'1px solid var(--line)',
          background:'#fff', color:'var(--ink)', cursor:'pointer',
          fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500,
          display:'inline-flex', alignItems:'center', gap: 8
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {t.export}
        </button>
      }>
      <div style={{ display:'flex', flexDirection:'column', gap: 18, maxWidth: 1280 }}>

        {/* Top filter bar */}
        <div style={{
          background:'#fff', borderRadius: 16, border:'1px solid var(--line)', padding: 14,
          display:'flex', flexDirection:'column', gap: 14
        }}>
          {/* Filter chips */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap: 6 }}>
              {[
                { k:'all',      label: t.filterAll,      n: filterCounts.all,      color:'#0a3d2e' },
                { k:'healthy',  label: t.filterHealthy,  n: filterCounts.healthy,  color:'#1f8a5b' },
                { k:'diseased', label: t.filterDiseased, n: filterCounts.diseased, color:'#d4a017' },
                { k:'lowconf',  label: t.filterLowConf,  n: filterCounts.lowconf,  color:'#9ca3af' },
              ].map(f => {
                const active = filter === f.k;
                return (
                  <button key={f.k} onClick={()=>setFilter(f.k)} style={{
                    display:'inline-flex', alignItems:'center', gap: 8,
                    padding:'8px 14px', borderRadius: 999, cursor:'pointer',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--ink-2)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                    fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius:'50%',
                      background: active ? '#84cc16' : f.color
                    }}/>
                    {f.label}
                    <span style={{
                      fontFamily:'var(--mono)', fontSize: 11,
                      color: active ? 'rgba(255,255,255,0.6)' : 'var(--muted)'
                    }}>{f.n}</span>
                  </button>
                );
              })}
            </div>

            {/* View toggle */}
            <div style={{
              display:'inline-flex', padding: 3, borderRadius: 10,
              background:'var(--paper)', border:'1px solid var(--line)'
            }}>
              {[
                { k:'list', label: t.viewList, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>) },
                { k:'grid', label: t.viewGrid, icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>) },
              ].map(v => {
                const active = view === v.k;
                return (
                  <button key={v.k} onClick={()=>setView(v.k)} style={{
                    display:'inline-flex', alignItems:'center', gap: 6,
                    padding:'7px 12px', borderRadius: 8, border:'none', cursor:'pointer',
                    background: active ? '#fff' : 'transparent',
                    color: active ? 'var(--ink)' : 'var(--muted)',
                    boxShadow: active ? '0 1px 2px rgba(10,31,21,0.06)' : 'none',
                    fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500
                  }}>{v.icon}{v.label}</button>
                );
              })}
            </div>
          </div>

          {/* Search + selects row */}
          <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
            <div style={{
              flex: 1, display:'flex', alignItems:'center', gap: 10,
              padding:'10px 14px', borderRadius: 10, background:'var(--paper)', border:'1px solid var(--line)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input placeholder={t.search} style={{
                border:'none', outline:'none', background:'transparent',
                flex: 1, fontFamily:'var(--sans)', fontSize: 13, color:'var(--ink)'
              }}/>
            </div>
            <Select label={t.plant} value={plant === 'all' ? t.plantAll : plant}/>
            <Select label={t.period} value={t.period30}/>
            <Select label={t.sortBy} value={t.sortNewest}/>
          </div>

          {/* Summary line */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            paddingTop: 12, borderTop:'1px dashed var(--line)',
            fontSize: 12, color:'var(--muted)'
          }}>
            <span>
              {t.showing} <span style={{ color:'var(--ink)', fontWeight: 600 }}>{filtered.length}</span> {t.of} {historyData.length} · {t.summary}
            </span>
            {selection.size > 0 && (
              <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                <span style={{ color:'var(--ink)', fontWeight: 600 }}>{selection.size} {t.selected}</span>
                <button style={mini}>{t.download}</button>
                <button style={{...mini, color:'#b91c1c'}}>{t.delete}</button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {view === 'list' ? (
          <div style={{ display:'flex', flexDirection:'column', gap: 24 }}>
            {groupOrder.map(g => grouped[g] ? (
              <div key={g}>
                <GroupHeader title={groupTitle(g, t)} count={grouped[g].length}/>
                <div style={{ background:'#fff', borderRadius: 16, border:'1px solid var(--line)', overflow:'hidden' }}>
                  {grouped[g].map((it, i) => (
                    <HistoryRow key={it.id} item={it} lang={lang}
                      selected={selection.has(it.id)} onToggle={()=>toggleSel(it.id)}
                      isLast={i === grouped[g].length - 1}/>
                  ))}
                </div>
              </div>
            ) : null)}
            {filtered.length === 0 && <EmptyState t={t}/>}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>
            {groupOrder.map(g => grouped[g] ? (
              <div key={g}>
                <GroupHeader title={groupTitle(g, t)} count={grouped[g].length}/>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14 }}>
                  {grouped[g].map(it => <HistoryCard key={it.id} item={it} lang={lang}/>)}
                </div>
              </div>
            ) : null)}
            {filtered.length === 0 && <EmptyState t={t}/>}
          </div>
        )}
      </div>
    </Shell>
  );
};

const mini = {
  padding:'6px 12px', borderRadius: 8, border:'1px solid var(--line)',
  background:'#fff', cursor:'pointer',
  fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500
};

const Select = ({ label, value }) => (
  <button style={{
    display:'inline-flex', flexDirection:'column', alignItems:'flex-start',
    padding:'7px 14px', borderRadius: 10, border:'1px solid var(--line)',
    background:'#fff', cursor:'pointer', gap: 1, minWidth: 140
  }}>
    <span style={{ fontSize: 9, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.10em' }}>{label}</span>
    <span style={{ display:'inline-flex', alignItems:'center', gap: 6, fontSize: 13, color:'var(--ink)', fontWeight: 500 }}>
      {value}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
    </span>
  </button>
);

const GroupHeader = ({ title, count }) => (
  <div style={{
    display:'flex', alignItems:'baseline', gap: 10, marginBottom: 10, padding:'0 4px'
  }}>
    <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, color:'var(--ink)' }}>{title}</h3>
    <span style={{ fontSize: 11, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>· {count}</span>
    <div style={{ flex: 1, height: 1, background:'var(--line)', marginLeft: 8 }}/>
  </div>
);

const HistoryRow = ({ item, lang, selected, onToggle, isLast }) => {
  const s = statusMeta(item.status, lang);
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'auto 60px 1fr 120px 140px 90px auto',
      alignItems:'center', gap: 16, padding:'14px 16px',
      borderBottom: isLast ? 'none' : '1px solid var(--line)',
      background: selected ? 'var(--primary-soft)' : 'transparent',
      transition: 'background .15s', cursor:'pointer'
    }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ accentColor:'var(--primary)', cursor:'pointer' }}/>

      <div style={{
        width: 56, height: 56, borderRadius: 10, overflow:'hidden',
        background:'#0a3d2e', flexShrink: 0, position:'relative'
      }}>
        <LeafSample size={56} showSpots={item.status !== 'ok'}/>
        <span style={{
          position:'absolute', bottom: 3, right: 3,
          width: 8, height: 8, borderRadius:'50%',
          background: s.dot, border:'2px solid #fff'
        }}/>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color:'var(--ink)' }}>
            {lang === 'UZ' ? item.plant : item.plantEn}
          </span>
          <span style={{
            fontFamily:'var(--mono)', fontSize: 10, color:'var(--muted)',
            padding:'2px 6px', borderRadius: 4, background:'rgba(10,31,21,0.04)'
          }}>{item.id}</span>
        </div>
        <div style={{
          fontSize: 12, color:'var(--ink-2)', marginTop: 2,
          display:'flex', alignItems:'center', gap: 6
        }}>
          <span>{lang === 'UZ' ? item.disease : item.diseaseEn}</span>
          <span style={{ color:'var(--line-strong)' }}>·</span>
          <span style={{ color:'var(--muted)' }}>{item.loc}</span>
        </div>
      </div>

      <span style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'4px 8px', borderRadius: 6,
        background: s.bg, color: s.fg,
        fontSize: 11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em',
        width:'fit-content'
      }}>
        <span style={{ width: 6, height: 6, borderRadius:'50%', background: s.dot }}/>
        {s.label}
      </span>

      <div>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background:'var(--line)', overflow:'hidden' }}>
            <div style={{
              width: item.conf + '%', height:'100%',
              background: item.status === 'ok' ? 'var(--primary)' : item.status === 'lowconf' ? '#9ca3af' : 'var(--accent)'
            }}/>
          </div>
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, marginTop: 4, color:'var(--ink)' }}>
          {item.conf}%
        </div>
      </div>

      <div style={{ fontSize: 12, color:'var(--muted)', fontFamily:'var(--mono)' }}>
        {item.time}
      </div>

      <button style={{
        width: 32, height: 32, borderRadius: 8, border:'1px solid var(--line)',
        background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
};

const HistoryCard = ({ item, lang }) => {
  const s = statusMeta(item.status, lang);
  return (
    <div style={{
      background:'#fff', borderRadius: 14, border:'1px solid var(--line)',
      overflow:'hidden', cursor:'pointer', transition:'transform .15s, box-shadow .15s'
    }}>
      <div style={{ position:'relative', aspectRatio:'1/1', background:'#0a3d2e' }}>
        <div style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <LeafSample size={180} showSpots={item.status !== 'ok'}/>
        </div>
        <span style={{
          position:'absolute', top: 8, left: 8,
          padding:'3px 7px', borderRadius: 5,
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
          color:'#fff', fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.06em',
          display:'inline-flex', alignItems:'center', gap: 5,
          border:'1px solid rgba(255,255,255,0.10)'
        }}>
          <span style={{ width: 5, height: 5, borderRadius:'50%', background: s.dot }}/>
          {s.label}
        </span>
        <span style={{
          position:'absolute', top: 8, right: 8,
          padding:'3px 8px', borderRadius: 5,
          background:'var(--accent)', color:'#1a1305',
          fontFamily:'var(--mono)', fontSize: 10, fontWeight: 700
        }}>{item.conf}%</span>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color:'var(--ink)' }}>
            {lang === 'UZ' ? item.plant : item.plantEn}
          </span>
          <span style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--muted)' }}>{item.id}</span>
        </div>
        <div style={{ fontSize: 11, color:'var(--ink-2)', marginTop: 3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {lang === 'UZ' ? item.disease : item.diseaseEn}
        </div>
        <div style={{ fontSize: 10, color:'var(--muted)', fontFamily:'var(--mono)', marginTop: 6, display:'flex', justifyContent:'space-between' }}>
          <span>{item.time}</span>
          <span>{item.loc.split('·')[0].trim()}</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div style={{
    padding: 60, borderRadius: 16, background:'#fff', border:'1px dashed var(--line)',
    textAlign:'center'
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14, margin:'0 auto 14px',
      background:'var(--primary-soft)', display:'flex', alignItems:'center', justifyContent:'center'
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    </div>
    <div style={{ fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.02em' }}>{t.empty}</div>
    <div style={{ marginTop: 4, fontSize: 13, color:'var(--muted)' }}>{t.emptySub}</div>
  </div>
);

window.HistoryScreen = HistoryScreen;
window.HT = HT;
window.historyData = historyData;
window.statusMeta = statusMeta;
window.groupOrder = groupOrder;
window.groupTitle = groupTitle;
