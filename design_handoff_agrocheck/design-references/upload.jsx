/* Agrocheck app — Upload + AI analysis screens
   Visual language inherited from Variant 1: dark green brand panel,
   light content, gold + lime accents, Instrument Serif headlines. */

/* ─────────────────  App shell  ───────────────── */

const Sidebar = ({ active = 'scan', lang = 'UZ' }) => {
  const items = lang === 'UZ' ? [
    { key:'scan',    label:'Tahlil',         icon: NavIconScan },
    { key:'history', label:'Tarix',          icon: NavIconHistory },
    { key:'stats',   label:'Statistika',     icon: NavIconStats },
    { key:'library', label:'Kasalliklar',    icon: NavIconLibrary },
    { key:'profile', label:'Profil',         icon: NavIconUser },
  ] : [
    { key:'scan',    label:'Scan',     icon: NavIconScan },
    { key:'history', label:'History',  icon: NavIconHistory },
    { key:'stats',   label:'Stats',    icon: NavIconStats },
    { key:'library', label:'Library',  icon: NavIconLibrary },
    { key:'profile', label:'Profile',  icon: NavIconUser },
  ];
  return (
    <aside style={{
      width: 240, background:'linear-gradient(180deg, #0a3d2e 0%, #06291e 100%)',
      color:'#fff', display:'flex', flexDirection:'column',
      padding:'22px 18px', position:'relative', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', inset:'auto -80px -120px auto', width: 260, height: 260,
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(212,160,23,0.35), transparent 60%)',
        filter:'blur(20px)', pointerEvents:'none'
      }}/>

      <Wordmark color="#fff" size={18}/>

      <div style={{ height: 28 }}/>
      <div style={{
        fontSize: 10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.12em',
        color:'rgba(255,255,255,0.45)', padding:'0 10px 10px'
      }}>{lang === 'UZ' ? 'Menyu' : 'Menu'}</div>

      <nav style={{ display:'flex', flexDirection:'column', gap: 2 }}>
        {items.map(it => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <a key={it.key} href="#" style={{
              display:'flex', alignItems:'center', gap: 12,
              padding:'11px 12px', borderRadius: 10,
              fontSize: 14, fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              border: isActive ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
              textDecoration:'none', position:'relative'
            }}>
              <Icon active={isActive}/>
              <span>{it.label}</span>
              {it.key === 'history' && (
                <span style={{
                  marginLeft:'auto', fontSize: 10, fontFamily:'var(--mono)',
                  padding:'2px 6px', borderRadius: 999,
                  background: isActive ? 'var(--accent)' : 'rgba(212,160,23,0.18)',
                  color: isActive ? '#1a1305' : 'var(--accent)'
                }}>24</span>
              )}
            </a>
          );
        })}
      </nav>

      <div style={{ marginTop:'auto', position:'relative' }}>
        {/* Pro card */}
        <div style={{
          padding: 14, borderRadius: 14,
          background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)',
          marginBottom: 14
        }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            padding:'3px 8px', borderRadius: 999,
            background:'rgba(132,204,22,0.18)', color:'#bef264',
            fontSize: 10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 10
          }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#84cc16' }}/>
            Pro
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
            {lang === 'UZ' ? 'Cheksiz tahlil va PDF hisobotlar' : 'Unlimited scans & PDF reports'}
          </div>
          <div style={{ fontSize: 12, color:'rgba(255,255,255,0.55)', marginTop: 4 }}>
            {lang === 'UZ' ? '49 000 so\'m / oy' : '$3.99 / month'}
          </div>
        </div>

        {/* User row */}
        <div style={{
          display:'flex', alignItems:'center', gap: 10, padding:'10px 8px',
          borderRadius: 10, background:'rgba(255,255,255,0.04)'
        }}>
          <div style={{
            width: 34, height: 34, borderRadius:'50%', flexShrink: 0,
            background:'linear-gradient(135deg, #d4a017, #84cc16)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight: 700, color:'#0a3d2e', fontSize: 13
          }}>KY</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Karim Yusupov</div>
            <div style={{ fontSize: 11, color:'rgba(255,255,255,0.5)', fontFamily:'var(--mono)' }}>Free · 6/10</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ title, breadcrumb, lang = 'UZ', setLang, rightSlot }) => (
  <header style={{
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'20px 32px', borderBottom:'1px solid var(--line)',
    background:'#fff', position:'sticky', top: 0, zIndex: 3
  }}>
    <div>
      {breadcrumb && (
        <div style={{ fontSize: 11, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom: 4 }}>
          {breadcrumb}
        </div>
      )}
      <h1 style={{ margin: 0, fontFamily:'var(--serif)', fontSize: 30, letterSpacing:'-0.02em', lineHeight: 1 }}>{title}</h1>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
      {rightSlot}
      <div style={{
        display:'flex', alignItems:'center', gap: 8, padding:'8px 12px',
        borderRadius: 10, border:'1px solid var(--line)', background:'#fff'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input placeholder={lang === 'UZ' ? 'Qidirish…' : 'Search…'}
          style={{ border:'none', outline:'none', fontFamily:'var(--sans)', fontSize: 13, width: 180, background:'transparent' }}/>
        <span style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', padding:'2px 5px', borderRadius: 4, border:'1px solid var(--line)' }}>⌘K</span>
      </div>
      <button style={{
        width: 40, height: 40, borderRadius: 10, border:'1px solid var(--line)',
        background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 0 1-4 0"/></svg>
        <span style={{ position:'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius:'50%', background:'var(--accent)', border:'2px solid #fff' }}/>
      </button>
      <LangSwitch value={lang} onChange={setLang} tone="light"/>
    </div>
  </header>
);

const Shell = ({ active = 'scan', title, breadcrumb, lang, setLang, rightSlot, children }) => (
  <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', height:'100%', background:'#fafaf7' }}>
    <Sidebar active={active} lang={lang}/>
    <div style={{ display:'flex', flexDirection:'column', minWidth: 0, overflow:'auto' }}>
      <Topbar title={title} breadcrumb={breadcrumb} lang={lang} setLang={setLang} rightSlot={rightSlot}/>
      <main style={{ padding: 32, flex: 1 }}>{children}</main>
    </div>
  </div>
);

/* ─────────────────  Nav icons  ───────────────── */
const NavIconScan = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3"/>
    <path d="M7 12h10" stroke={active ? 'var(--accent)' : 'currentColor'}/>
  </svg>
);
const NavIconHistory = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/></svg>);
const NavIconStats = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21V9M9 21V3M15 21v-7M21 21V12"/></svg>);
const NavIconLibrary = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h6v16H4zM14 4h6v16h-6z"/></svg>);
const NavIconUser = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>);

/* ─────────────────  Leaf placeholder (reused, with state variants)  ───────────────── */
const LeafSample = ({ severity = 'mild', size = 360, showScan = false, showSpots = false }) => {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} style={{ display:'block' }}>
      <defs>
        <radialGradient id={`leafbg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a4d24"/>
          <stop offset="100%" stopColor="#0a3d1e"/>
        </radialGradient>
        <pattern id={`stripes-${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#84cc16" opacity="0.18"/>
          <rect x="3" width="3" height="6" fill="#84cc16" opacity="0.06"/>
        </pattern>
      </defs>
      {/* leaf body */}
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z"
        fill={`url(#leafbg-${id})`}/>
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z"
        fill={`url(#stripes-${id})`}/>
      {/* main vein */}
      <path d="M200 30 Q 210 200 195 370" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none"/>
      {/* side veins */}
      {[80,140,200,260,320].map((y,i) => (
        <path key={i} d={`M${200 - (i%2===0?0:0)} ${y} Q ${130 + i*4} ${y+20} ${60 + i*8} ${y+40}`} stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none"/>
      ))}
      {[80,140,200,260,320].map((y,i) => (
        <path key={`r${i}`} d={`M200 ${y} Q ${270 - i*4} ${y+20} ${340 - i*8} ${y+40}`} stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none"/>
      ))}
      {/* disease spots */}
      {showSpots && (
        <>
          <circle cx="270" cy="160" r="18" fill="#3a2a0a" opacity="0.7"/>
          <circle cx="270" cy="160" r="11" fill="#5a3a12"/>
          <circle cx="270" cy="160" r="5" fill="#8b5a1a"/>
          <circle cx="150" cy="240" r="12" fill="#3a2a0a" opacity="0.6"/>
          <circle cx="150" cy="240" r="6" fill="#5a3a12"/>
          <circle cx="220" cy="300" r="14" fill="#3a2a0a" opacity="0.6"/>
          <circle cx="220" cy="300" r="8" fill="#5a3a12"/>
          <circle cx="220" cy="300" r="3" fill="#8b5a1a"/>
        </>
      )}
      {/* scan annotations */}
      {showScan && (
        <>
          <rect x="245" y="135" width="50" height="50" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
          <text x="248" y="129" fontFamily="JetBrains Mono" fontSize="9" fill="#fbbf24" letterSpacing="0.05em">SPOT 01 · 92%</text>
          <rect x="135" y="225" width="32" height="32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
          <rect x="205" y="285" width="32" height="32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
        </>
      )}
    </svg>
  );
};

/* ─────────────────  Translations  ───────────────── */
const UT = {
  UZ: {
    scanTitle: 'Yangi tahlil',
    breadcrumb: 'Bosh sahifa · Tahlil',
    uploadHeadline: 'O\'simlik bargi rasmini yuklang',
    uploadSub: 'Sun\'iy intellekt 3 soniyada kasallikni aniqlab beradi',
    dropHere: 'Rasmni shu yerga tashlang',
    or: 'yoki',
    chooseFile: 'Fayl tanlash',
    takePhoto: 'Suratga olish',
    fileHint: 'JPG, PNG · maksimal 10 MB',
    sampleTitle: 'Yoki namuna rasmlardan birini tanlang',
    recentTitle: 'Oxirgi tahlillar',
    seeAll: 'Hammasini ko\'rish',
    analyzing: 'AI tahlil qilmoqda',
    analyzingSub: 'Tasvir Qwen 3.5 modeli orqali tahlil qilinmoqda',
    step1: 'Tasvirni qayta ishlash',
    step2: 'Xususiyatlarni ajratish',
    step3: 'Klassifikatsiya',
    step4: 'Davolash usulini tayyorlash',
    resultTitle: 'Tahlil natijasi',
    resultBreadcrumb: 'Tahlil · Natija',
    detected: 'Aniqlangan kasallik',
    confidence: 'Ishonch darajasi',
    severity: 'Og\'irlik darajasi',
    severityMed: 'O\'rta',
    affected: 'Zararlangan maydon',
    description: 'Tavsifi',
    treatment: 'Davolash bo\'yicha tavsiyalar',
    prevention: 'Profilaktika',
    diseaseName: 'Pomidor bargi · Erta dog\'lanish',
    diseaseLatin: 'Alternaria solani',
    diseaseDesc: 'Erta dog\'lanish (Early Blight) — pomidor bargida tez tarqaladigan zamburug\'li kasallik. Avval pastki barglarda jigarrang dog\'lar paydo bo\'lib, ular kontsentrik halqa shaklida kengayadi. Davolanmasa, hosildorlikni 30–50% gacha kamaytirishi mumkin.',
    topMatch: 'Eng yuqori taxmin',
    otherPredictions: 'Boshqa ehtimoliy variantlar',
    referenceImages: 'Ma\'lumotlar bazasidagi shunga o\'xshash rasmlar',
    modelNoteTitle: 'Model haqida',
    modelNote: 'AI butun rasmni ko\'rib bir nechta kasallik turlaridan eng ehtimollisini tanlaydi. Barg ustidagi aniq nuqtalarni belgilab bera olmaydi — bu klassifikatsiya modeli, detektsiya emas.',
    fromDataset: 'PlantVillage dataset',
    tStep1: 'Zararlangan barglarni darhol kesib oling va yoqib yuboring — boshqa o\'simliklarga yuqishini oldini oladi.',
    tStep2: 'Mis-sulfat (1%) yoki Bordo suyuqligi bilan har 7–10 kunda 2–3 marta sepish kerak.',
    tStep3: 'Sug\'orishni ildiz ostidan amalga oshiring — yaproqlarni ho\'l qilmang.',
    tStep4: 'Almashlab ekishni qo\'llang: 3 yil davomida bir joyga pomidor ekmang.',
    downloadPdf: 'PDF hisobot',
    scanAgain: 'Yana tahlil',
    askExpert: 'Mutaxassisga yo\'llash',
    save: 'Saqlash',
    today: 'Bugun',
    yesterday: 'Kecha',
  },
  EN: {
    scanTitle: 'New scan',
    breadcrumb: 'Home · Scan',
    uploadHeadline: 'Upload a leaf photo',
    uploadSub: 'Our AI identifies the disease in 3 seconds',
    dropHere: 'Drop your image here',
    or: 'or',
    chooseFile: 'Choose file',
    takePhoto: 'Use camera',
    fileHint: 'JPG, PNG · up to 10 MB',
    sampleTitle: 'Or try a sample',
    recentTitle: 'Recent scans',
    seeAll: 'See all',
    analyzing: 'AI is analyzing',
    analyzingSub: 'Running image through the Qwen 3.5 model',
    step1: 'Preprocessing image',
    step2: 'Extracting features',
    step3: 'Classification',
    step4: 'Preparing treatment plan',
    resultTitle: 'Scan result',
    resultBreadcrumb: 'Scan · Result',
    detected: 'Detected disease',
    confidence: 'Confidence',
    severity: 'Severity',
    severityMed: 'Moderate',
    affected: 'Affected area',
    description: 'Description',
    treatment: 'Treatment plan',
    prevention: 'Prevention',
    diseaseName: 'Tomato Leaf · Early Blight',
    diseaseLatin: 'Alternaria solani',
    diseaseDesc: 'Early Blight is a fast-spreading fungal disease in tomato leaves. It starts as brown spots on lower leaves that expand into concentric rings. Untreated, it can reduce yield by 30–50%.',
    topMatch: 'Top prediction',
    otherPredictions: 'Other possible matches',
    referenceImages: 'Similar images from our database',
    modelNoteTitle: 'About this prediction',
    modelNote: 'The AI classifies the whole image into one of several disease categories — it does not localize specific spots on the leaf. This is classification, not detection.',
    fromDataset: 'PlantVillage dataset',
    tStep1: 'Immediately remove and burn affected leaves to stop spread to other plants.',
    tStep2: 'Spray with 1% copper sulfate or Bordeaux mixture every 7–10 days, 2–3 times.',
    tStep3: 'Water at the root only — do not wet the leaves.',
    tStep4: 'Rotate crops: avoid planting tomatoes in the same spot for 3 years.',
    downloadPdf: 'PDF report',
    scanAgain: 'Scan again',
    askExpert: 'Ask an expert',
    save: 'Save',
    today: 'Today',
    yesterday: 'Yesterday',
  }
};

/* ─────────────────  UPLOAD SCREEN  ───────────────── */
const UploadScreen = ({ lang: initLang = 'UZ' }) => {
  const [lang, setLang] = React.useState(initLang);
  const [drag, setDrag] = React.useState(false);
  const t = UT[lang];

  return (
    <Shell active="scan" title={t.scanTitle} breadcrumb={t.breadcrumb} lang={lang} setLang={setLang}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap: 28, maxWidth: 1300 }}>
        <div>
          {/* Drop zone */}
          <div
            onDragOver={(e)=>{ e.preventDefault(); setDrag(true); }}
            onDragLeave={()=>setDrag(false)}
            onDrop={(e)=>{ e.preventDefault(); setDrag(false); }}
            style={{
              borderRadius: 22, padding: '56px 40px',
              border: `2px dashed ${drag ? 'var(--primary)' : 'rgba(10,61,46,0.18)'}`,
              background: drag ? 'rgba(10,61,46,0.04)' : '#fff',
              transition: 'all .2s ease',
              display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
              position:'relative', overflow:'hidden'
            }}>
            <div style={{
              position:'absolute', top:-40, right:-40, width: 200, height: 200, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(132,204,22,0.10), transparent 60%)', filter:'blur(20px)'
            }}/>
            <div style={{
              position:'absolute', bottom:-50, left:-50, width: 220, height: 220, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(212,160,23,0.08), transparent 60%)', filter:'blur(20px)'
            }}/>

            <div style={{
              position:'relative',
              width: 84, height: 84, borderRadius: 22,
              background:'linear-gradient(155deg, #0a3d2e, #134d3a)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 14px 40px -10px rgba(10,61,46,0.4)'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M3 16v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4"/>
              </svg>
              <span style={{
                position:'absolute', top:-6, right:-6, padding:'2px 8px', borderRadius: 999,
                background:'var(--accent)', color:'#1a1305',
                fontSize: 10, fontFamily:'var(--mono)', fontWeight: 700, letterSpacing:'0.04em'
              }}>AI</span>
            </div>

            <h2 style={{ position:'relative', fontFamily:'var(--serif)', fontSize: 36, margin:'24px 0 6px', letterSpacing:'-0.02em', lineHeight: 1.05 }}>
              {t.uploadHeadline}
            </h2>
            <p style={{ position:'relative', color:'var(--muted)', fontSize: 15, margin:'0 0 24px', maxWidth: 420 }}>
              {t.uploadSub}
            </p>

            <div style={{ position:'relative', display:'flex', gap: 10, marginBottom: 16 }}>
              <button style={{
                height: 50, padding:'0 22px', borderRadius: 12, border:'none', cursor:'pointer',
                background:'var(--primary)', color:'#fff',
                fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600,
                display:'inline-flex', alignItems:'center', gap: 10
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v15"/></svg>
                {t.chooseFile}
              </button>
              <button style={{
                height: 50, padding:'0 22px', borderRadius: 12, cursor:'pointer',
                background:'#fff', color:'var(--ink)', border:'1px solid var(--line-strong)',
                fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600,
                display:'inline-flex', alignItems:'center', gap: 10
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                {t.takePhoto}
              </button>
            </div>

            <div style={{ position:'relative', fontFamily:'var(--mono)', fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {t.fileHint}
            </div>
          </div>

          {/* Sample images */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color:'var(--ink)' }}>
                {t.sampleTitle}
              </h3>
              <span style={{ fontSize: 11, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {lang === 'UZ' ? 'Bepul' : 'Free'}
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12 }}>
              {[
                { name: lang==='UZ' ? 'Pomidor bargi' : 'Tomato leaf', tag:'Early Blight' },
                { name: lang==='UZ' ? 'Olma bargi' : 'Apple leaf', tag:'Cedar Rust' },
                { name: lang==='UZ' ? 'Uzum bargi' : 'Grape leaf', tag:'Mildew' },
                { name: lang==='UZ' ? 'Kartoshka' : 'Potato', tag:'Late Blight' },
              ].map((s,i) => (
                <button key={i} style={{
                  background:'#fff', border:'1px solid var(--line)', borderRadius: 14,
                  padding: 10, cursor:'pointer', textAlign:'left',
                  display:'flex', flexDirection:'column', gap: 8
                }}>
                  <div style={{ height: 80, borderRadius: 10, overflow:'hidden', background:'#0a3d2e' }}>
                    <LeafSample size={120} showSpots={i!==1}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color:'var(--ink)' }}>{s.name}</div>
                    <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', marginTop: 2, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent scans rail */}
        <RecentScans lang={lang}/>
      </div>
    </Shell>
  );
};

const RecentScans = ({ lang }) => {
  const t = UT[lang];
  const items = [
    { name: lang==='UZ' ? 'Pomidor bargi' : 'Tomato leaf', tag:'Early Blight', conf: 97, time: lang==='UZ' ? '2 soat oldin' : '2 hours ago', status:'warn' },
    { name: lang==='UZ' ? 'Bodring' : 'Cucumber',     tag:'Healthy',      conf: 99, time: lang==='UZ' ? '5 soat oldin' : '5 hours ago', status:'ok' },
    { name: lang==='UZ' ? 'Olma bargi' : 'Apple leaf',  tag:'Cedar Rust',   conf: 92, time: t.yesterday, status:'warn' },
    { name: lang==='UZ' ? 'Uzum bargi' : 'Grape leaf',  tag:'Healthy',      conf: 96, time: t.yesterday, status:'ok' },
    { name: lang==='UZ' ? 'Kartoshka' : 'Potato',       tag:'Late Blight',  conf: 89, time: '12 may', status:'bad' },
  ];
  return (
    <aside style={{
      background:'#fff', borderRadius: 22, border:'1px solid var(--line)',
      padding: 22, height:'fit-content', position:'sticky', top: 20
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600 }}>{t.recentTitle}</h3>
        <a href="#" style={{ fontSize: 12, color:'var(--primary)', textDecoration:'none', fontWeight: 500 }}>{t.seeAll}</a>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
        {items.map((it, i) => {
          const color = it.status === 'ok' ? '#0a3d2e' : it.status === 'warn' ? '#d4a017' : '#b91c1c';
          const bg    = it.status === 'ok' ? 'rgba(10,61,46,0.06)' : it.status === 'warn' ? 'rgba(212,160,23,0.10)' : 'rgba(185,28,28,0.08)';
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 10, padding: 8, borderRadius: 10,
              transition:'background .15s', cursor:'pointer'
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, overflow:'hidden',
                background:'#0a3d2e', flexShrink: 0, position:'relative'
              }}>
                <LeafSample size={42} showSpots={it.status !== 'ok'}/>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {it.name}
                </div>
                <div style={{ display:'flex', gap: 6, alignItems:'center', marginTop: 2 }}>
                  <span style={{
                    fontSize: 10, fontFamily:'var(--mono)', padding:'2px 6px', borderRadius: 4,
                    background: bg, color
                  }}>{it.tag}</span>
                  <span style={{ fontSize: 10, color:'var(--muted)' }}>· {it.time}</span>
                </div>
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize: 12, color, fontWeight: 600 }}>{it.conf}%</div>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 16, paddingTop: 14, borderTop:'1px dashed var(--line)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div>
          <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            {lang==='UZ' ? 'Bu oyda' : 'This month'}
          </div>
          <div style={{ fontFamily:'var(--serif)', fontSize: 24, letterSpacing:'-0.02em' }}>24 / 50</div>
        </div>
        <div style={{ width: 70, height: 4, borderRadius: 2, background:'var(--line)', overflow:'hidden' }}>
          <div style={{ width:'48%', height:'100%', background:'var(--primary)' }}/>
        </div>
      </div>
    </aside>
  );
};

/* ─────────────────  ANALYZING SCREEN  ───────────────── */
const AnalyzingScreen = ({ lang: initLang = 'UZ' }) => {
  const [lang, setLang] = React.useState(initLang);
  const t = UT[lang];
  const steps = [t.step1, t.step2, t.step3, t.step4];

  return (
    <Shell active="scan" title={t.scanTitle} breadcrumb={t.breadcrumb} lang={lang} setLang={setLang}>
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 28, maxWidth: 1200 }}>
        <div style={{
          position:'relative', borderRadius: 22, overflow:'hidden',
          background:'linear-gradient(155deg, #0a3d2e, #06291a)',
          aspectRatio:'4 / 5', display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          {/* corner brackets */}
          {[
            { top: 16, left: 16 }, { top: 16, right: 16 },
            { bottom: 16, left: 16 }, { bottom: 16, right: 16 }
          ].map((p, i) => (
            <div key={i} style={{
              position:'absolute', width: 28, height: 28,
              borderTop: i < 2 ? '2px solid var(--accent)' : 'none',
              borderBottom: i >= 2 ? '2px solid var(--accent)' : 'none',
              borderLeft: (i % 2 === 0) ? '2px solid var(--accent)' : 'none',
              borderRight: (i % 2 === 1) ? '2px solid var(--accent)' : 'none',
              ...p
            }}/>
          ))}

          <LeafSample size={420} showSpots/>

          {/* scanning line */}
          <div className="scanline" style={{
            position:'absolute', left: 24, right: 24, height: 2,
            background:'linear-gradient(90deg, transparent, var(--accent), transparent)',
            boxShadow:'0 0 20px var(--accent)',
            animation:'scanmove 2.4s ease-in-out infinite'
          }}/>
          <style>{`
            @keyframes scanmove {
              0% { top: 30px; }
              50% { top: calc(100% - 30px); }
              100% { top: 30px; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.05); }
            }
            @keyframes barProg {
              0% { width: 0%; }
              100% { width: 64%; }
            }
            .progBar { animation: barProg 2s ease-out forwards; }
          `}</style>

          <div style={{
            position:'absolute', top: 20, left:'50%', transform:'translateX(-50%)',
            padding:'6px 14px', borderRadius: 999,
            background:'rgba(0,0,0,0.4)', color:'#fff',
            fontFamily:'var(--mono)', fontSize: 11, letterSpacing:'0.12em', textTransform:'uppercase',
            display:'inline-flex', alignItems:'center', gap: 8,
            border:'1px solid rgba(255,255,255,0.10)', backdropFilter:'blur(8px)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius:'50%', background:'#84cc16', animation:'pulse 1s ease-in-out infinite' }}/>
            Scanning
          </div>

          {/* HUD chips */}
          <div style={{
            position:'absolute', bottom: 20, left: 20, right: 20,
            display:'flex', justifyContent:'space-between', alignItems:'flex-end',
            color:'#fff', fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.06em'
          }}>
            <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', padding:'8px 10px', borderRadius: 8, border:'1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>Image</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>1024 × 1024</div>
            </div>
            <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', padding:'8px 10px', borderRadius: 8, border:'1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>Model</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>Qwen 3.5 · 4B</div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap: 24 }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap: 8, padding:'4px 10px', borderRadius: 999,
              background:'rgba(132,204,22,0.12)', color:'#3f6b13',
              fontSize: 11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 14
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#84cc16', animation:'pulse 1s ease-in-out infinite' }}/>
              AI · Live
            </div>
            <h2 style={{ margin: 0, fontFamily:'var(--serif)', fontSize: 44, lineHeight: 1.05, letterSpacing:'-0.02em' }}>
              {t.analyzing}…
            </h2>
            <p style={{ margin:'10px 0 0', color:'var(--muted)', fontSize: 15, lineHeight: 1.5, maxWidth: 380 }}>
              {t.analyzingSub}
            </p>
          </div>

          {/* progress steps */}
          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            {steps.map((s, i) => {
              const done = i < 2;
              const active = i === 2;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius:'50%', flexShrink: 0,
                    background: done ? 'var(--primary)' : active ? '#fff' : 'transparent',
                    border: done ? 'none' : `1.5px solid ${active ? 'var(--primary)' : 'var(--line-strong)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: done ? '#fff' : 'var(--primary)',
                    fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600,
                    position:'relative'
                  }}>
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5 9-9"/></svg>
                    ) : active ? (
                      <span style={{ width: 8, height: 8, borderRadius:'50%', background:'var(--primary)', animation:'pulse 1s ease-in-out infinite' }}/>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15, fontWeight: active ? 600 : 500,
                      color: done || active ? 'var(--ink)' : 'var(--muted)',
                      transition:'color .2s'
                    }}>{s}</div>
                    {active && (
                      <div style={{ height: 3, background:'var(--line)', borderRadius: 2, marginTop: 8, overflow:'hidden' }}>
                        <div className="progBar" style={{ height:'100%', background:'var(--primary)', borderRadius: 2 }}/>
                      </div>
                    )}
                  </div>
                  {done && (
                    <span style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--muted)' }}>
                      {i === 0 ? '0.4s' : '0.9s'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button style={{
            alignSelf:'flex-start', marginTop: 8,
            padding:'10px 16px', borderRadius: 10, cursor:'pointer',
            background:'transparent', border:'1px solid var(--line-strong)', color:'var(--ink-2)',
            fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500
          }}>
            {lang === 'UZ' ? 'Bekor qilish' : 'Cancel'}
          </button>
        </div>
      </div>
    </Shell>
  );
};

/* ─────────────────  RESULT SCREEN (honest classification)  ───────────────── */
const ResultScreen = ({ lang: initLang = 'UZ' }) => {
  const [lang, setLang] = React.useState(initLang);
  const t = UT[lang];

  /* Top-N predictions — typical output of a classification model:
     a probability distribution over all known disease classes. */
  const predictions = [
    { name: lang==='UZ' ? 'Erta dog\'lanish'  : 'Early Blight',       latin: 'Alternaria solani',    conf: 97.4 },
    { name: lang==='UZ' ? 'Kech dog\'lanish'  : 'Late Blight',        latin: 'Phytophthora infestans', conf: 1.8 },
    { name: lang==='UZ' ? 'Septoria dog\'i'   : 'Septoria Leaf Spot', latin: 'Septoria lycopersici', conf: 0.5 },
    { name: lang==='UZ' ? 'Sog\'lom'          : 'Healthy',            latin: '—',                    conf: 0.3 },
  ];

  return (
    <Shell active="scan" title={t.resultTitle} breadcrumb={t.resultBreadcrumb}
      lang={lang} setLang={setLang}
      rightSlot={
        <button style={{
          height: 40, padding:'0 14px', borderRadius: 10, border:'1px solid var(--line)',
          background:'#fff', color:'var(--ink)', cursor:'pointer',
          fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500,
          display:'inline-flex', alignItems:'center', gap: 8
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {t.downloadPdf}
        </button>
      }>
      <div style={{ display:'grid', gridTemplateColumns:'1.05fr 1fr', gap: 24, maxWidth: 1300 }}>

        {/* LEFT COLUMN — image + predictions + references */}
        <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>

          {/* Clean leaf image (no fake bounding boxes) */}
          <div style={{
            position:'relative', borderRadius: 22, overflow:'hidden',
            background:'linear-gradient(155deg, #0a3d2e, #06291a)',
            aspectRatio:'4 / 3'
          }}>
            <div style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LeafSample size={380} showSpots/>
            </div>

            {/* Soft AI glow overlay — implies "AI looked at this image" without pretending to localize */}
            <div style={{
              position:'absolute', inset: 0,
              background:'radial-gradient(circle at 50% 50%, rgba(132,204,22,0.10), transparent 65%)',
              pointerEvents:'none'
            }}/>

            {/* Corner brackets - decorative scan frame */}
            {[
              { top: 16, left: 16 }, { top: 16, right: 16 },
              { bottom: 16, left: 16 }, { bottom: 16, right: 16 }
            ].map((p, i) => (
              <div key={i} style={{
                position:'absolute', width: 24, height: 24,
                borderTop:    i < 2  ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderBottom: i >= 2 ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderLeft:   (i % 2 === 0) ? '2px solid rgba(255,255,255,0.4)' : 'none',
                borderRight:  (i % 2 === 1) ? '2px solid rgba(255,255,255,0.4)' : 'none',
                ...p
              }}/>
            ))}

            <div style={{ position:'absolute', top: 16, left: 16 }}>
              <Chip dark>{lang==='UZ' ? 'AI tahlil qildi' : 'AI analyzed'}</Chip>
            </div>

            <div style={{
              position:'absolute', bottom: 16, left: 16, right: 16,
              display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              color:'#fff'
            }}>
              <div style={{
                background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)',
                padding:'10px 14px', borderRadius: 12, border:'1px solid rgba(255,255,255,0.10)'
              }}>
                <div style={{ fontFamily:'var(--mono)', fontSize: 10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {t.detected}
                </div>
                <div style={{ fontFamily:'var(--serif)', fontSize: 22, marginTop: 2, letterSpacing:'-0.01em' }}>
                  {predictions[0].name}
                </div>
              </div>
              <div style={{
                background:'var(--accent)', color:'#1a1305',
                padding:'10px 16px', borderRadius: 12, fontFamily:'var(--mono)', fontWeight: 700
              }}>
                {predictions[0].conf}%
              </div>
            </div>
          </div>

          {/* Top-N predictions card — honest classification output */}
          <div style={{
            background:'#fff', borderRadius: 22, border:'1px solid var(--line)', padding: 22
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600 }}>
                {t.otherPredictions}
              </h3>
              <span style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {lang==='UZ' ? 'Model chiqishi' : 'Model output'}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {predictions.map((p, i) => {
                const isTop = i === 0;
                const barColor = isTop ? 'var(--primary)' : i === 1 ? 'var(--accent)' : 'var(--muted)';
                return (
                  <div key={i} style={{
                    display:'grid', gridTemplateColumns:'180px 1fr 56px', gap: 14, alignItems:'center',
                    padding: isTop ? '8px 12px' : '4px 12px', borderRadius: 10,
                    background: isTop ? 'var(--primary-soft)' : 'transparent',
                    border: isTop ? '1px solid rgba(10,61,46,0.10)' : '1px solid transparent'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isTop ? 600 : 500, color: isTop ? 'var(--primary)' : 'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {isTop && (
                          <span style={{
                            display:'inline-block', width: 6, height: 6, borderRadius:'50%',
                            background:'var(--primary)', marginRight: 8, verticalAlign:'middle'
                          }}/>
                        )}
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, fontStyle:'italic', color:'var(--muted)', marginTop: 1 }}>
                        {p.latin}
                      </div>
                    </div>
                    <div style={{ height: 6, background:'var(--line)', borderRadius: 3, overflow:'hidden' }}>
                      <div style={{ width: Math.max(p.conf, 0.5) + '%', height:'100%', background: barColor, borderRadius: 3 }}/>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize: 12, fontWeight: 600, textAlign:'right', color: isTop ? 'var(--primary)' : 'var(--muted)' }}>
                      {p.conf}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 16, paddingTop: 14, borderTop:'1px dashed var(--line)',
              fontSize: 11, color:'var(--muted)', display:'flex', alignItems:'flex-start', gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
              <span style={{ lineHeight: 1.5, textWrap:'pretty' }}>{t.modelNote}</span>
            </div>
          </div>

          {/* Reference images from training data */}
          <div style={{
            background:'#fff', borderRadius: 22, border:'1px solid var(--line)', padding: 22
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600 }}>
                {t.referenceImages}
              </h3>
              <span style={{
                fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)',
                textTransform:'uppercase', letterSpacing:'0.08em',
                padding:'3px 8px', borderRadius: 4, background:'rgba(10,31,21,0.05)'
              }}>{t.fromDataset}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  position:'relative', aspectRatio:'1/1', borderRadius: 10, overflow:'hidden',
                  background:'#0a3d2e', border:'1px solid rgba(10,61,46,0.10)'
                }}>
                  <div style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <LeafSample size={140} showSpots/>
                  </div>
                  <div style={{
                    position:'absolute', bottom: 4, right: 4,
                    padding:'2px 6px', borderRadius: 4,
                    background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
                    color:'#fff', fontFamily:'var(--mono)', fontSize: 9, letterSpacing:'0.04em'
                  }}>#{1247 + i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — diagnosis + treatment + actions */}
        <div style={{ display:'flex', flexDirection:'column', gap: 18 }}>

          {/* Disease header with confidence ring */}
          <div style={{
            background:'#fff', borderRadius: 22, border:'1px solid var(--line)',
            padding: 22, position:'relative', overflow:'hidden'
          }}>
            <div style={{
              position:'absolute', top:-40, right:-40, width: 180, height: 180, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(212,160,23,0.10), transparent 60%)', filter:'blur(20px)', pointerEvents:'none'
            }}/>

            <div style={{ display:'flex', gap: 18, alignItems:'flex-start', position:'relative' }}>
              <div style={{ flex: 1 }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 6, padding:'4px 10px', borderRadius: 999,
                  background:'rgba(212,160,23,0.14)', color:'#8a6610',
                  fontSize: 11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em',
                  marginBottom: 10
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>
                  {t.topMatch}
                </span>
                <h2 style={{ margin: 0, fontFamily:'var(--serif)', fontSize: 30, lineHeight: 1.05, letterSpacing:'-0.02em' }}>
                  {t.diseaseName}
                </h2>
                <div style={{ marginTop: 4, fontStyle:'italic', color:'var(--muted)', fontSize: 13 }}>{t.diseaseLatin}</div>
              </div>

              {/* Confidence ring */}
              <ConfidenceRing value={97.4}/>
            </div>

            <p style={{ marginTop: 14, marginBottom: 0, color:'var(--ink-2)', fontSize: 14, lineHeight: 1.6, textWrap:'pretty', position:'relative' }}>
              {t.diseaseDesc}
            </p>

            <div style={{
              display:'flex', gap: 8, marginTop: 14, position:'relative'
            }}>
              <SeverityPill label={t.severity} value={t.severityMed} tone="warn"/>
              <SeverityPill label={lang==='UZ' ? 'Tarqalish' : 'Spread'} value={lang==='UZ' ? 'Tez' : 'Fast'} tone="warn"/>
              <SeverityPill label={lang==='UZ' ? 'Mavsum' : 'Season'} value={lang==='UZ' ? 'Yoz' : 'Summer'} tone="neutral"/>
            </div>
          </div>

          {/* Treatment plan */}
          <div style={{
            background:'#fff', borderRadius: 22, border:'1px solid var(--line)', padding: 22
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600 }}>{t.treatment}</h3>
              <span style={{
                fontSize: 10, fontFamily:'var(--mono)', color:'var(--primary)',
                textTransform:'uppercase', letterSpacing:'0.08em',
                padding:'3px 8px', borderRadius: 4, background:'var(--primary-soft)'
              }}>4 {lang==='UZ' ? 'qadam' : 'steps'}</span>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle:'none', display:'flex', flexDirection:'column', gap: 12 }}>
              {[t.tStep1, t.tStep2, t.tStep3, t.tStep4].map((step, i) => (
                <li key={i} style={{ display:'flex', gap: 14 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius:'50%', flexShrink: 0,
                    background:'var(--primary-soft)', color:'var(--primary)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--mono)', fontSize: 12, fontWeight: 600
                  }}>
                    {String(i+1).padStart(2,'0')}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color:'var(--ink-2)', textWrap:'pretty', flex: 1 }}>{step}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap: 10 }}>
            <button style={{
              flex: 1, height: 48, borderRadius: 12, border:'none', cursor:'pointer',
              background:'var(--primary)', color:'#fff',
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              {t.scanAgain}
            </button>
            <button style={{
              flex: 1, height: 48, borderRadius: 12, cursor:'pointer',
              background:'#fff', color:'var(--ink)', border:'1px solid var(--line-strong)',
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8
            }}>
              {t.askExpert}
            </button>
            <button style={{
              width: 48, height: 48, borderRadius: 12, cursor:'pointer',
              background:'#fff', color:'var(--ink)', border:'1px solid var(--line-strong)',
              display:'inline-flex', alignItems:'center', justifyContent:'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
};

const ConfidenceRing = ({ value = 97.4 }) => {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ position:'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="6"/>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--primary)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"/>
      </svg>
      <div style={{
        position:'absolute', inset: 0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center'
      }}>
        <div style={{ fontFamily:'var(--serif)', fontSize: 20, lineHeight: 1, color:'var(--primary)', letterSpacing:'-0.02em' }}>
          {value}%
        </div>
        <div style={{ fontSize: 8, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.10em', marginTop: 2 }}>
          conf.
        </div>
      </div>
    </div>
  );
};

const SeverityPill = ({ label, value, tone = 'ok' }) => {
  const colorMap = {
    ok:     { fg: '#0a3d2e', bg: 'rgba(10,61,46,0.06)'   },
    warn:   { fg: '#8a6610', bg: 'rgba(212,160,23,0.10)' },
    bad:    { fg: '#b91c1c', bg: 'rgba(185,28,28,0.08)'  },
    neutral:{ fg: 'var(--ink-2)', bg: 'rgba(10,31,21,0.05)'},
  }[tone] || { fg: 'var(--ink)', bg: '#fff' };
  return (
    <div style={{
      flex: 1, padding:'8px 10px', borderRadius: 10,
      background: colorMap.bg, color: colorMap.fg,
      display:'flex', flexDirection:'column'
    }}>
      <span style={{ fontSize: 9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{value}</span>
    </div>
  );
};

const Chip = ({ children, dark }) => (
  <span style={{
    padding:'4px 8px', borderRadius: 6, fontSize: 10, fontFamily:'var(--mono)',
    letterSpacing:'0.08em', textTransform:'uppercase',
    background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)',
    color: dark ? '#fff' : '#0a3d2e',
    backdropFilter:'blur(8px)',
    border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(10,61,46,0.10)'
  }}>{children}</span>
);

const MetricCard = ({ label, value, hint, tone='ok', progress }) => {
  const color = tone === 'ok' ? '#0a3d2e' : tone === 'warn' ? '#d4a017' : '#b91c1c';
  return (
    <div style={{
      background:'#fff', borderRadius: 16, border:'1px solid var(--line)',
      padding: 16
    }}>
      <div style={{ fontSize: 10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
      <div style={{ fontFamily:'var(--serif)', fontSize: 28, marginTop: 4, color, letterSpacing:'-0.01em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color:'var(--muted)', marginTop: 6 }}>{hint}</div>
      {progress != null && (
        <div style={{ height: 4, background:'var(--line)', borderRadius: 2, marginTop: 10, overflow:'hidden' }}>
          <div style={{ width: progress+'%', height:'100%', background: color }}/>
        </div>
      )}
    </div>
  );
};

window.UploadScreen = UploadScreen;
window.AnalyzingScreen = AnalyzingScreen;
window.ResultScreen = ResultScreen;
window.LeafSample = LeafSample;
window.UT = UT;
