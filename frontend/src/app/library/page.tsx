"use client";
import { useState } from "react";
import { Shell } from "@/components/Shell";

interface DiseaseEntry {
  plant: string;
  disease: string;
  isHealthy: boolean;
  severity: "healthy" | "mild" | "moderate" | "severe";
  latinName: string | null;
  description: string;
}

const DISEASES: DiseaseEntry[] = [
  { plant: "Olma",      disease: "Qo'tir (Apple Scab)",         isHealthy: false, severity: "moderate", latinName: "Venturia inaequalis",                    description: "Barglar va mevada qo'ng'ir dog'lar hosil qiladi. Nam ob-havo bilan tez tarqaladi." },
  { plant: "Olma",      disease: "Qora chirishlik",              isHealthy: false, severity: "severe",   latinName: "Botryosphaeria obtusa",                  description: "Mevada va novdada qora dog'lar hosil qiladi. Kuz faslida og'ir zarar yetkazadi." },
  { plant: "Olma",      disease: "Zang kasalligi",               isHealthy: false, severity: "moderate", latinName: "Gymnosporangium juniperi-virginianae",    description: "Barglarning ustida sariq-to'q sariq dog'lar paydo bo'ladi." },
  { plant: "Olma",      disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Smorodina", disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Gilos",     disease: "Unli shudring",                isHealthy: false, severity: "moderate", latinName: "Podosphaera clandestina",                 description: "Barglarda oq unsimon qoplam hosil bo'ladi. Issiq va quruq ob-havo bilan avj oladi." },
  { plant: "Gilos",     disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Makkajo'xori", disease: "Kulrang barg dog'i",        isHealthy: false, severity: "moderate", latinName: "Cercospora zeae-maydis",                 description: "Barglarda kulrang to'rtburchak dog'lar hosil bo'ladi." },
  { plant: "Makkajo'xori", disease: "Oddiy zang",                isHealthy: false, severity: "moderate", latinName: "Puccinia sorghi",                        description: "Bargda qo'ng'ir-to'q sariq zang qobiqlari paydo bo'ladi." },
  { plant: "Makkajo'xori", disease: "Shimoliy barg yanishi",     isHealthy: false, severity: "severe",   latinName: "Exserohilum turcicum",                   description: "Uzun, kulrang-yashil yarali dog'lar hosil qiladi. Hosildorlikka katta zarar." },
  { plant: "Makkajo'xori", disease: "Sog'lom",                   isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Uzum",      disease: "Qora chirishlik",              isHealthy: false, severity: "severe",   latinName: "Guignardia bidwellii",                   description: "Meva, barg va novdalarda qora dog'lar. Yig'im-terimdan oldin jiddiy zarar." },
  { plant: "Uzum",      disease: "Esca (Qora chechak)",          isHealthy: false, severity: "severe",   latinName: "Phaeoacremonium aleophilum",              description: "Ko'p yillik yog'ochli kasallik. Barg tomir orasida sariq dog'lar." },
  { plant: "Uzum",      disease: "Barg yanishi",                 isHealthy: false, severity: "moderate", latinName: "Isariopsis clavispora",                  description: "Barglarning ustki qismida qo'ng'ir nekrotik dog'lar." },
  { plant: "Uzum",      disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Apelsin",   disease: "Xuanglunbing (Greening)",      isHealthy: false, severity: "severe",   latinName: "Candidatus Liberibacter asiaticus",      description: "Sitrus o'simliklarini nobud qiluvchi eng xavfli kasallik. Davolash mumkin emas." },
  { plant: "Shaftoli",  disease: "Bakterial dog'",               isHealthy: false, severity: "moderate", latinName: "Xanthomonas campestris",                 description: "Barglar, mevalarda qo'ng'ir suv singib chiqqan dog'lar." },
  { plant: "Shaftoli",  disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Qalampir",  disease: "Bakterial dog'",               isHealthy: false, severity: "moderate", latinName: "Xanthomonas campestris pv. vesicatoria", description: "Barglarda suv singigan, keyin sariq doirali qo'ng'ir dog'lar." },
  { plant: "Qalampir",  disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Kartoshka", disease: "Erta qo'ng'ir dog'",           isHealthy: false, severity: "moderate", latinName: "Alternaria solani",                      description: "Barglarda konsentrik halqali qo'ng'ir dog'lar. Quruq, issiq ob-havoda kuchayadi." },
  { plant: "Kartoshka", disease: "Kech chirishlik (Late Blight)", isHealthy: false, severity: "severe",   latinName: "Phytophthora infestans",                 description: "Juda xavfli kasallik. Barglarda suv singgan dog'lar tez ildizga o'tadi." },
  { plant: "Kartoshka", disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Malina",    disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Soya",      disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Qovoq",     disease: "Unli shudring",                isHealthy: false, severity: "mild",     latinName: "Erysiphe cichoracearum",                 description: "Barglarda oq unli qoplam. Quruq ob-havoda kuchayadi." },
  { plant: "Qulupnay",  disease: "Barg qurishi",                 isHealthy: false, severity: "moderate", latinName: "Diplocarpon earliana",                   description: "Barglarda aylana qo'ng'ir dog'lar hosil bo'ladi." },
  { plant: "Qulupnay",  disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
  { plant: "Pomidor",   disease: "Bakterial dog'",               isHealthy: false, severity: "moderate", latinName: "Xanthomonas vesicatoria",                description: "Barglarda suv singgan, sariq doirali qo'ng'ir dog'lar." },
  { plant: "Pomidor",   disease: "Erta qo'ng'ir dog'",           isHealthy: false, severity: "moderate", latinName: "Alternaria solani",                      description: "Barglarda ko'zli-halqali qo'ng'ir dog'lar. Pastki barglardan boshlanadi." },
  { plant: "Pomidor",   disease: "Kech chirishlik",              isHealthy: false, severity: "severe",   latinName: "Phytophthora infestans",                 description: "Barglarda qo'ng'ir-qora dog'lar tez butun o'simlikni qoplaydi." },
  { plant: "Pomidor",   disease: "Barg zanggi (Leaf Mold)",      isHealthy: false, severity: "mild",     latinName: "Fulvia fulva",                           description: "Bargning ostida sariq-yashil zang qoplami hosil bo'ladi." },
  { plant: "Pomidor",   disease: "Septoria barg dog'i",          isHealthy: false, severity: "moderate", latinName: "Septoria lycopersici",                   description: "Barglarda qora chegarali kichik oq dog'lar ko'payib boradi." },
  { plant: "Pomidor",   disease: "O'rgimchak kana zararkunandasi", isHealthy: false, severity: "mild",   latinName: null,                                     description: "Barglarda sariq nuqtalar va o'rgimchak to'rlari. Issiq ob-havoda kuchayadi." },
  { plant: "Pomidor",   disease: "Nishon dog' (Target Spot)",    isHealthy: false, severity: "moderate", latinName: "Corynespora cassiicola",                 description: "Barglarda halqali, nishonga o'xshash qo'ng'ir dog'lar." },
  { plant: "Pomidor",   disease: "Sariq barg burash virusi",     isHealthy: false, severity: "severe",   latinName: "Tomato yellow leaf curl virus",          description: "Barglar burishadi va sariqlanadi. Oq kana orqali tarqaladi." },
  { plant: "Pomidor",   disease: "Mozaika virusi",               isHealthy: false, severity: "moderate", latinName: "Tomato mosaic virus",                   description: "Barglarda mozaik sariq-yashil naqsh hosil bo'ladi." },
  { plant: "Pomidor",   disease: "Sog'lom",                      isHealthy: true,  severity: "healthy",  latinName: null,                                     description: "O'simlik sog'lom, kasallik belgilari yo'q." },
];

const SEVERITY_META = {
  healthy:  { label: "Sog'lom",  fg: "#0a3d2e", bg: "rgba(10,61,46,.08)",   dot: "#1f8a5b" },
  mild:     { label: "Engil",    fg: "#5a7a3a", bg: "rgba(90,122,58,.08)",   dot: "#84cc16" },
  moderate: { label: "O'rta",    fg: "#8a6610", bg: "rgba(212,160,23,.10)",  dot: "#d4a017" },
  severe:   { label: "Og'ir",    fg: "#b91c1c", bg: "rgba(185,28,28,.08)",   dot: "#dc2626" },
};

const PLANT_ICONS: Record<string, string> = {
  "Pomidor": "🍅", "Kartoshka": "🥔", "Uzum": "🍇", "Olma": "🍎",
  "Makkajo'xori": "🌽", "Qalampir": "🫑", "Shaftoli": "🍑", "Gilos": "🍒",
  "Apelsin": "🍊", "Qovoq": "🎃", "Qulupnay": "🍓", "Smorodina": "🫐",
  "Malina": "🫐", "Soya": "🌱",
};

function SeverityBadge({ severity }: { severity: DiseaseEntry["severity"] }) {
  const s = SEVERITY_META[severity];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, background: s.bg, color: s.fg, fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function DiseaseCard({ entry }: { entry: DiseaseEntry }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--line)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, transition: "box-shadow .15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{entry.disease}</div>
          {entry.latinName && (
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 3, fontStyle: "italic" }}>{entry.latinName}</div>
          )}
        </div>
        <SeverityBadge severity={entry.severity} />
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>{entry.description}</div>
    </div>
  );
}

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<"all" | DiseaseEntry["severity"]>("all");

  const plants = DISEASES.map(d => d.plant).filter((p, i, arr) => arr.indexOf(p) === i);

  const filtered = DISEASES.filter(d => {
    if (filterSeverity !== "all" && d.severity !== filterSeverity) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.plant.toLowerCase().includes(q) || d.disease.toLowerCase().includes(q) || (d.latinName?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const grouped: Record<string, DiseaseEntry[]> = {};
  filtered.forEach(d => {
    if (!grouped[d.plant]) grouped[d.plant] = [];
    grouped[d.plant].push(d);
  });

  const totalDiseases = DISEASES.filter(d => !d.isHealthy).length;
  const plantCount = plants.length;

  const SEVERITY_FILTERS: { k: "all" | DiseaseEntry["severity"]; label: string }[] = [
    { k: "all",      label: "Barchasi" },
    { k: "severe",   label: "Og'ir" },
    { k: "moderate", label: "O'rta" },
    { k: "mild",     label: "Engil" },
    { k: "healthy",  label: "Sog'lom" },
  ];

  return (
    <Shell title="Kasalliklar" breadcrumb="Bosh sahifa · Kasalliklar">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            { label: "Jami kasalliklar", value: String(totalDiseases), color: "#b91c1c", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22c1-3.5 6-5 6-11a6 6 0 1 0-12 0c0 6 5 7.5 6 11Z" /></svg> },
            { label: "O'simlik turlari", value: String(plantCount), color: "#0a3d2e", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22V12M7 22v-5M17 22v-8M2 22V18M22 22v-4" /></svg> },
            { label: "Og'ir kasalliklar", value: String(DISEASES.filter(d => d.severity === "severe").length), color: "#dc2626", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
            { label: "AI modeli aniqligi", value: "94.2%", color: "#d4a017", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" /></svg> },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, background: "var(--paper)", border: "1px solid var(--line)", flex: 1, minWidth: 220 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kasallik yoki o'simlik qidirish…" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {SEVERITY_FILTERS.map(f => {
              const active = filterSeverity === f.k;
              const meta = f.k === "all" ? null : SEVERITY_META[f.k];
              return (
                <button key={f.k} onClick={() => setFilterSeverity(f.k)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${active ? "var(--primary)" : "var(--line)"}`, background: active ? "var(--primary)" : "#fff", color: active ? "#fff" : "var(--ink-2)", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500 }}>
                  {meta && <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#84cc16" : meta.dot }} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Disease groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(grouped).map(([plant, entries]) => (
            <div key={plant}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{PLANT_ICONS[plant] ?? "🌿"}</span>
                <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{plant}</h3>
                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", padding: "2px 7px", borderRadius: 6, background: "rgba(10,31,21,.05)" }}>{entries.length} ta</span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {entries.map((e, i) => <DiseaseCard key={i} entry={e} />)}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Hech narsa topilmadi
            </div>
          )}
        </div>

      </div>
    </Shell>
  );
}
