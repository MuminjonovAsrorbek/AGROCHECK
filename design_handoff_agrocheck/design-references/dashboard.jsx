/* Dashboard / Statistika screen — V1 design language */

/* ─────────── Translations ─────────── */
const DT = {
  UZ: {
    title: 'Statistika',
    breadcrumb: 'Bosh sahifa · Statistika',
    range7: '7 kun',
    range30: '30 kun',
    range90: '3 oy',
    rangeYear: 'Bu yil',
    export: 'Eksport',
    kpiTotal: 'Jami tahlillar',
    kpiThisMonth: 'Bu oyda',
    kpiHealthy: 'Sog\'lom natija',
    kpiAccuracy: 'O\'rta ishonch',
    chartTitle: 'Tahlillar tendensiyasi',
    chartSub: 'So\'nggi 30 kun · kunlik',
    healthyLabel: 'Sog\'lom',
    diseasedLabel: 'Kasallangan',
    diseasesTitle: 'Eng ko\'p uchragan kasalliklar',
    diseasesSub: 'Bu oyda · 24 ta tahlildan',
    plantsTitle: 'O\'simlik turlari',
    activityTitle: 'Faollik',
    streak: 'Ketma-ket kun',
    longestStreak: 'Eng uzun',
    days: 'kun',
    vsLast: 'o\'tgan oyga nisbatan',
    allDiseases: 'Barchasini ko\'rish',
    scans: 'tahlil',
    weeklyHeader: 'Bu hafta',
    mon: 'Du', tue: 'Se', wed: 'Ch', thu: 'Pa', fri: 'Ju', sat: 'Sh', sun: 'Ya'
  },
  EN: {
    title: 'Statistics',
    breadcrumb: 'Home · Statistics',
    range7: '7 days', range30: '30 days', range90: '3 months', rangeYear: 'Year',
    export: 'Export',
    kpiTotal: 'Total scans',
    kpiThisMonth: 'This month',
    kpiHealthy: 'Healthy result',
    kpiAccuracy: 'Avg confidence',
    chartTitle: 'Scan trend',
    chartSub: 'Last 30 days · daily',
    healthyLabel: 'Healthy',
    diseasedLabel: 'Diseased',
    diseasesTitle: 'Most common diseases',
    diseasesSub: 'This month · across 24 scans',
    plantsTitle: 'Plant types',
    activityTitle: 'Activity',
    streak: 'Day streak',
    longestStreak: 'Longest',
    days: 'days',
    vsLast: 'vs last month',
    allDiseases: 'See all',
    scans: 'scans',
    weeklyHeader: 'This week',
    mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su'
  }
};

/* ─────────── Mock data ─────────── */
const trendData = [
  2,3,1,4,2,3,5,2,4,3,5,7,4,6,3,4,8,5,3,6,4,7,9,6,4,8,5,7,4,6
]; // 30 days
const diseasedData = [
  1,2,0,2,1,2,3,1,2,1,3,4,2,3,1,2,5,3,2,4,2,4,5,3,2,5,3,4,2,3
];

const diseaseDistribution = [
  { name: 'Early Blight',  uz:'Erta dog\'lanish',     value: 32, color: '#0a3d2e' },
  { name: 'Cedar Rust',    uz:'Sarv zang',            value: 21, color: '#d4a017' },
  { name: 'Late Blight',   uz:'Kech dog\'lanish',     value: 16, color: '#84cc16' },
  { name: 'Powdery Mildew',uz:'Kul rang chirish',     value: 12, color: '#1f8a5b' },
  { name: 'Septoria Spot', uz:'Septoria dog\'i',      value: 10, color: '#b8860b' },
  { name: 'Healthy',       uz:'Sog\'lom',             value:  9, color: '#cdd9d3' },
];

const plantTypes = [
  { name:'Pomidor',  en:'Tomato',   count: 48, healthy: 18 },
  { name:'Olma',     en:'Apple',    count: 32, healthy: 11 },
  { name:'Uzum',     en:'Grape',    count: 24, healthy: 14 },
  { name:'Bodring',  en:'Cucumber', count: 18, healthy: 10 },
  { name:'Kartoshka',en:'Potato',   count: 12, healthy:  4 },
  { name:'Boshqa',   en:'Other',    count:  8, healthy:  5 },
];

const sparkSamples = {
  total:   [4,5,3,6,5,7,4,8,6,9],
  month:   [2,4,3,5,3,6,4,5,7,8],
  healthy: [4,3,5,4,6,5,4,6,5,7],
  acc:     [88,89,90,92,91,93,94,95,96,97],
};

/* ─────────── Chart components ─────────── */

const Sparkline = ({ data, color = 'var(--primary)', width = 80, height = 30 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ overflow:'visible' }}>
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color.replace(/[^a-z0-9]/gi,'')})`}/>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const TrendChart = ({ lang }) => {
  const t = DT[lang];
  const W = 620, H = 260, PADX = 20, PADY = 30;
  const max = Math.max(...trendData);

  const toPath = (data) => {
    return data.map((v, i) => {
      const x = PADX + (i / (data.length - 1)) * (W - 2 * PADX);
      const y = H - PADY - (v / max) * (H - 2 * PADY);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };
  const totalPath = toPath(trendData);
  const diseasedPath = toPath(diseasedData);
  const totalArea = totalPath + ` L ${W - PADX} ${H - PADY} L ${PADX} ${H - PADY} Z`;
  const diseasedArea = diseasedPath + ` L ${W - PADX} ${H - PADY} L ${PADX} ${H - PADY} Z`;

  // Highlight point at the end
  const lastX = PADX + ((trendData.length-1) / (trendData.length - 1)) * (W - 2 * PADX);
  const lastY = H - PADY - (trendData[trendData.length-1] / max) * (H - 2 * PADY);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id="trend-total" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a3d2e" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#0a3d2e" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="trend-disease" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a017" stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#d4a017" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* y grid */}
      {[0,1,2,3,4].map(i => {
        const y = PADY + (i / 4) * (H - 2 * PADY);
        const val = Math.round(max - (i / 4) * max);
        return (
          <g key={i}>
            <line x1={PADX} x2={W - PADX} y1={y} y2={y} stroke="rgba(10,31,21,0.06)" strokeDasharray={i === 4 ? '0' : '3 3'}/>
            <text x={PADX - 6} y={y + 3} fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" textAnchor="end">{val}</text>
          </g>
        );
      })}
      {/* x labels (every 5 days) */}
      {trendData.map((_, i) => {
        if (i % 5 !== 0 && i !== trendData.length - 1) return null;
        const x = PADX + (i / (trendData.length - 1)) * (W - 2 * PADX);
        return <text key={i} x={x} y={H - 8} fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" textAnchor="middle">{i+1}</text>;
      })}
      {/* total area + line */}
      <path d={totalArea} fill="url(#trend-total)"/>
      <path d={totalPath} stroke="#0a3d2e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* diseased area + line */}
      <path d={diseasedArea} fill="url(#trend-disease)"/>
      <path d={diseasedPath} stroke="#d4a017" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3"/>
      {/* end highlight */}
      <circle cx={lastX} cy={lastY} r="8" fill="#0a3d2e" opacity="0.12"/>
      <circle cx={lastX} cy={lastY} r="4" fill="#0a3d2e"/>
      <g transform={`translate(${lastX - 60}, ${lastY - 38})`}>
        <rect width="55" height="22" rx="6" fill="#0a3d2e"/>
        <text x="27.5" y="14" fontFamily="JetBrains Mono" fontWeight="600" fontSize="10" fill="#fff" textAnchor="middle">
          {trendData[trendData.length-1]} {t.scans}
        </text>
      </g>
    </svg>
  );
};

const DonutChart = ({ data, size = 200, thickness = 28 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size/2}, ${size/2}) rotate(-90)`}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = c * frac;
          const el = (
            <circle key={i} cx="0" cy="0" r={r}
              fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"/>
          );
          offset += dash;
          return el;
        })}
      </g>
      <text x={size/2} y={size/2 - 2} fontFamily="Instrument Serif" fontSize="34" fill="var(--ink)" textAnchor="middle" letterSpacing="-0.02em">
        {total}
      </text>
      <text x={size/2} y={size/2 + 18} fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" textAnchor="middle" letterSpacing="0.10em">
        SCANS
      </text>
    </svg>
  );
};

/* ─────────── KPI card ─────────── */
const KpiCard = ({ label, value, change, sparkData, sparkColor, hint, icon, accent }) => (
  <div style={{
    background:'#fff', borderRadius: 18, border:'1px solid var(--line)',
    padding: 18, position:'relative', overflow:'hidden'
  }}>
    {accent && (
      <div style={{
        position:'absolute', top:-30, right:-30, width: 120, height: 120, borderRadius:'50%',
        background:`radial-gradient(circle, ${accent}, transparent 60%)`, opacity: 0.15, filter:'blur(10px)'
      }}/>
    )}
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
      <div>
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)',
          textTransform:'uppercase', letterSpacing:'0.10em'
        }}>
          {icon}
          {label}
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize: 36, letterSpacing:'-0.02em', lineHeight: 1, marginTop: 8 }}>
          {value}
        </div>
        {change && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 4, marginTop: 10,
            fontSize: 11, color: change.up ? '#1f8a5b' : '#b91c1c', fontWeight: 600
          }}>
            <span>{change.up ? '↑' : '↓'}</span>
            <span>{change.value}</span>
            <span style={{ color:'var(--muted)', fontWeight: 400, marginLeft: 4 }}>{hint}</span>
          </div>
        )}
      </div>
      {sparkData && (
        <div style={{ position:'relative' }}>
          <Sparkline data={sparkData} color={sparkColor || 'var(--primary)'} width={80} height={32}/>
        </div>
      )}
    </div>
  </div>
);

/* ─────────── Dashboard screen ─────────── */
const DashboardScreen = ({ lang: initLang = 'UZ' }) => {
  const [lang, setLang] = React.useState(initLang);
  const [range, setRange] = React.useState('30');
  const t = DT[lang];

  return (
    <Shell active="stats" title={t.title} breadcrumb={t.breadcrumb}
      lang={lang} setLang={setLang}
      rightSlot={
        <>
          <div style={{
            display:'inline-flex', padding: 3, borderRadius: 10,
            background:'#fff', border:'1px solid var(--line)',
            fontFamily:'var(--mono)', fontSize: 11, letterSpacing:'0.04em'
          }}>
            {[['7', t.range7],['30', t.range30],['90', t.range90],['365', t.rangeYear]].map(([k, label]) => (
              <button key={k} onClick={()=>setRange(k)} style={{
                padding:'6px 12px', borderRadius: 8, border:'none', cursor:'pointer',
                background: range === k ? 'var(--primary)' : 'transparent',
                color: range === k ? '#fff' : 'var(--muted)',
                fontFamily:'inherit', fontSize:'inherit', fontWeight: 500,
                transition: 'all .15s'
              }}>{label}</button>
            ))}
          </div>
          <button style={{
            height: 40, padding:'0 14px', borderRadius: 10, border:'1px solid var(--line)',
            background:'#fff', color:'var(--ink)', cursor:'pointer',
            fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500,
            display:'inline-flex', alignItems:'center', gap: 8
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {t.export}
          </button>
        </>
      }>
      <div style={{ display:'flex', flexDirection:'column', gap: 18, maxWidth: 1280 }}>

        {/* KPI Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14 }}>
          <KpiCard
            label={t.kpiTotal}
            value="142"
            change={{ up: true, value:'+12%' }}
            hint={t.vsLast}
            sparkData={sparkSamples.total}
            sparkColor="#0a3d2e"
            icon={
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M7 12h10"/></svg>
            }
            accent="#0a3d2e"
          />
          <KpiCard
            label={t.kpiThisMonth}
            value="24"
            change={{ up: true, value:'+8' }}
            hint={t.vsLast}
            sparkData={sparkSamples.month}
            sparkColor="#d4a017"
            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
            accent="#d4a017"
          />
          <KpiCard
            label={t.kpiHealthy}
            value="38%"
            change={{ up: false, value:'-4%' }}
            hint={t.vsLast}
            sparkData={sparkSamples.healthy}
            sparkColor="#84cc16"
            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c1-3.5 6-5 6-11a6 6 0 1 0-12 0c0 6 5 7.5 6 11Z"/></svg>}
            accent="#84cc16"
          />
          <KpiCard
            label={t.kpiAccuracy}
            value="94.2%"
            change={{ up: true, value:'+1.1%' }}
            hint={t.vsLast}
            sparkData={sparkSamples.acc}
            sparkColor="#1f8a5b"
            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></svg>}
            accent="#1f8a5b"
          />
        </div>

        {/* Trend + donut row */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 14 }}>
          <Card>
            <CardHeader title={t.chartTitle} subtitle={t.chartSub} right={
              <div style={{ display:'flex', gap: 14, fontSize: 11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                <LegendDot color="#0a3d2e" label={lang==='UZ' ? 'Jami' : 'Total'} solid/>
                <LegendDot color="#d4a017" label={t.diseasedLabel}/>
              </div>
            }/>
            <div style={{ padding:'0 6px' }}>
              <TrendChart lang={lang}/>
            </div>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 8,
              borderTop:'1px solid var(--line)', paddingTop: 14, marginTop: 8
            }}>
              <MiniStat label={lang==='UZ' ? 'O\'rtacha kunlik' : 'Daily avg'} value="4.7"/>
              <MiniStat label={lang==='UZ' ? 'Peak kun' : 'Peak day'} value="9"/>
              <MiniStat label={lang==='UZ' ? 'Sog\'lom %' : 'Healthy %'} value="38%"/>
            </div>
          </Card>

          <Card>
            <CardHeader title={t.diseasesTitle} subtitle={t.diseasesSub} right={
              <a href="#" style={{ fontSize: 12, color:'var(--primary)', textDecoration:'none', fontWeight: 500 }}>{t.allDiseases}</a>
            }/>
            <div style={{ display:'flex', alignItems:'center', gap: 18 }}>
              <DonutChart data={diseaseDistribution} size={180}/>
              <div style={{ flex: 1, display:'flex', flexDirection:'column', gap: 8, minWidth: 0 }}>
                {diseaseDistribution.slice(0, 6).map((d, i) => {
                  const total = diseaseDistribution.reduce((s, x) => s + x.value, 0);
                  const pct = Math.round((d.value / total) * 100);
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {lang === 'UZ' ? d.uz : d.name}
                      </span>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--muted)', fontSize: 11 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Plant types + Activity */}
        <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap: 14 }}>
          <Card>
            <CardHeader title={t.plantsTitle} subtitle={lang==='UZ' ? 'Sog\'lom va kasal nisbati' : 'Healthy vs diseased ratio'}/>
            <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
              {plantTypes.map((p, i) => {
                const healthyPct = (p.healthy / p.count) * 100;
                const diseasedPct = 100 - healthyPct;
                return (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'130px 1fr 60px', gap: 14, alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, overflow:'hidden',
                        background:'#0a3d2e', flexShrink: 0
                      }}>
                        <LeafSample size={28} showSpots={p.count - p.healthy > 0}/>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color:'var(--ink)' }}>
                        {lang === 'UZ' ? p.name : p.en}
                      </div>
                    </div>
                    <div style={{ display:'flex', height: 8, borderRadius: 4, overflow:'hidden', background:'rgba(212,160,23,0.18)' }}>
                      <div style={{ width: healthyPct + '%', background:'var(--primary)' }}/>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize: 12, fontWeight: 600, color:'var(--ink)' }}>{p.count}</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--muted)' }}>{Math.round(healthyPct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              display:'flex', gap: 14, marginTop: 16, paddingTop: 14,
              borderTop:'1px solid var(--line)',
              fontSize: 11, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em'
            }}>
              <LegendDot color="var(--primary)" label={t.healthyLabel} solid/>
              <LegendDot color="rgba(212,160,23,0.5)" label={t.diseasedLabel} solid/>
            </div>
          </Card>

          <Card>
            <CardHeader title={t.activityTitle} subtitle={t.weeklyHeader}/>
            {/* Streak */}
            <div style={{
              background:'linear-gradient(155deg, #0a3d2e, #06291a)', color:'#fff',
              borderRadius: 14, padding: 16, position:'relative', overflow:'hidden'
            }}>
              <div style={{
                position:'absolute', inset:'auto -40px -60px auto', width: 180, height: 180, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(212,160,23,0.4), transparent 60%)', filter:'blur(20px)'
              }}/>
              <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.10em' }}>
                    {t.streak}
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize: 44, letterSpacing:'-0.02em', lineHeight: 1 }}>12</span>
                    <span style={{ color:'rgba(255,255,255,0.6)', fontSize: 13 }}>{t.days}</span>
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background:'rgba(212,160,23,0.18)', border:'1px solid rgba(212,160,23,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M14 2v6h6M7 11l3 3 7-7"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>
                </div>
              </div>
              <div style={{ position:'relative', fontSize: 11, color:'rgba(255,255,255,0.5)', marginTop: 8 }}>
                {t.longestStreak}: 28 {t.days}
              </div>
            </div>

            {/* Weekday bars */}
            <div style={{ marginTop: 16, display:'flex', justifyContent:'space-between', alignItems:'flex-end', height: 90, padding:'0 4px' }}>
              {[
                { d: t.mon, v: 3, today: false },
                { d: t.tue, v: 5, today: false },
                { d: t.wed, v: 2, today: false },
                { d: t.thu, v: 7, today: false },
                { d: t.fri, v: 4, today: false },
                { d: t.sat, v: 6, today: true },
                { d: t.sun, v: 0, today: false },
              ].map((day, i) => {
                const h = (day.v / 7) * 70 + (day.v > 0 ? 4 : 0);
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 6, flex: 1 }}>
                    <div style={{
                      width: 18, height: h || 4, borderRadius: 4,
                      background: day.today ? 'var(--accent)' : 'var(--primary)',
                      opacity: day.v === 0 ? 0.15 : 1,
                      position:'relative'
                    }}>
                      {day.v > 0 && (
                        <span style={{
                          position:'absolute', top: -16, left:'50%', transform:'translateX(-50%)',
                          fontFamily:'var(--mono)', fontSize: 10, color: day.today ? '#8a6610' : 'var(--ink)', fontWeight: 600
                        }}>{day.v}</span>
                      )}
                    </div>
                    <div style={{
                      fontFamily:'var(--mono)', fontSize: 10,
                      color: day.today ? 'var(--accent)' : 'var(--muted)',
                      fontWeight: day.today ? 700 : 400, textTransform:'uppercase', letterSpacing:'0.04em'
                    }}>{day.d}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

/* ─────────── Small helpers ─────────── */
const Card = ({ children, style }) => (
  <div style={{
    background:'#fff', borderRadius: 18, border:'1px solid var(--line)',
    padding: 22, display:'flex', flexDirection:'column', gap: 14, ...style
  }}>{children}</div>
);

const CardHeader = ({ title, subtitle, right }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
    <div>
      <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color:'var(--ink)' }}>{title}</h3>
      {subtitle && <div style={{ fontSize: 11, color:'var(--muted)', marginTop: 3 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

const LegendDot = ({ color, label, solid }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap: 6 }}>
    <span style={{
      width: 10, height: 2, background: color, borderRadius: 2,
      borderTop: solid ? 'none' : `2px dashed ${color}`,
      ...(solid ? {} : { background:'transparent' })
    }}/>
    <span style={{ color:'var(--muted)' }}>{label}</span>
  </span>
);

const MiniStat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
    <div style={{ fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.02em', marginTop: 2 }}>{value}</div>
  </div>
);

window.DashboardScreen = DashboardScreen;
