"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/lib/api";

interface ScanItem {
  id: string; plant: string; disease_name: string; confidence: number;
  severity: string; is_healthy: boolean; created_at: string; image_url: string;
}

type Status = "ok" | "warn" | "bad" | "lowconf";
type View = "list" | "grid";
type Filter = "all" | "healthy" | "diseased" | "lowconf";
type Period = "7" | "30" | "90" | "365";
type Sort = "newest" | "oldest" | "confidence_desc" | "confidence_asc";

function imgUrl(u: string) {
  return u.replace("minio:9000", "localhost:9200");
}

function scanStatus(s: ScanItem): Status {
  if (s.is_healthy) return "ok";
  if (s.confidence < 70) return "lowconf";
  if (s.severity === "severe") return "bad";
  return "warn";
}

function dateGroup(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return "week";
  if (diff < 30) return "month";
  return "earlier";
}

const GROUP_ORDER = ["today", "yesterday", "week", "month", "earlier"];
const GROUP_LABELS: Record<string, string> = {
  today: "Bugun", yesterday: "Kecha", week: "Bu hafta", month: "Bu oy", earlier: "Avvalroq"
};

const STATUS_META: Record<Status, { fg: string; bg: string; dot: string; label: string }> = {
  ok:      { fg: "#0a3d2e", bg: "rgba(10,61,46,0.06)",   dot: "#1f8a5b", label: "Sog'lom" },
  warn:    { fg: "#8a6610", bg: "rgba(212,160,23,0.10)", dot: "#d4a017", label: "O'rta" },
  bad:     { fg: "#b91c1c", bg: "rgba(185,28,28,0.08)",  dot: "#dc2626", label: "Og'ir" },
  lowconf: { fg: "#5b5045", bg: "rgba(91,80,69,0.08)",   dot: "#9ca3af", label: "Past ishonch" },
};

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_META[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.fg, fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function ConfBar({ conf, status }: { conf: number; status: Status }) {
  const color = status === "ok" ? "var(--primary)" : status === "lowconf" ? "#9ca3af" : "var(--accent)";
  return (
    <div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ width: `${conf}%`, height: "100%", background: color }} />
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, marginTop: 4, color: "var(--ink)" }}>{conf.toFixed(1)}%</div>
    </div>
  );
}

function GroupHeader({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, padding: "0 4px" }}>
      <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title}</h3>
      <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>· {count}</span>
      <div style={{ flex: 1, height: 1, background: "var(--line)", marginLeft: 8 }} />
    </div>
  );
}

function Thumbnail({ scan, size = 56 }: { scan: ScanItem; size?: number }) {
  const status = scanStatus(scan);
  const s = STATUS_META[status];
  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: "hidden", background: "#0a3d2e", flexShrink: 0, position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgUrl(scan.image_url)} alt={scan.plant} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <span style={{ position: "absolute", bottom: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: s.dot, border: "2px solid #fff" }} />
    </div>
  );
}

function HistoryRow({ scan, selected, onToggle, isLast }: { scan: ScanItem; selected: boolean; onToggle: () => void; isLast: boolean }) {
  const status = scanStatus(scan);
  const shortId = `#${scan.id.slice(0, 4).toUpperCase()}`;
  const time = new Date(scan.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 60px 1fr 120px 140px 90px auto",
      alignItems: "center", gap: 16, padding: "14px 16px",
      borderBottom: isLast ? "none" : "1px solid var(--line)",
      background: selected ? "var(--primary-soft)" : "transparent",
      transition: "background .15s", cursor: "pointer"
    }}>
      <input type="checkbox" checked={selected} onChange={onToggle} onClick={e => e.stopPropagation()} style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
      <Thumbnail scan={scan} size={56} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{scan.plant}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", padding: "2px 6px", borderRadius: 4, background: "rgba(10,31,21,0.04)" }}>{shortId}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{scan.disease_name}</span>
          <span style={{ color: "var(--line-strong)" }}>·</span>
          <span style={{ color: "var(--muted)" }}>Toshkent</span>
        </div>
      </div>
      <StatusPill status={status} />
      <ConfBar conf={scan.confidence} status={status} />
      <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>{time}</div>
      <Link href={`/scan/${scan.id}`} onClick={e => e.stopPropagation()} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M9 5l7 7-7 7" /></svg>
      </Link>
    </div>
  );
}

function HistoryRowMobile({ scan }: { scan: ScanItem }) {
  const status = scanStatus(scan);
  const s = STATUS_META[status];
  const shortId = `#${scan.id.slice(0, 4).toUpperCase()}`;
  return (
    <Link href={`/scan/${scan.id}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
      <Thumbnail scan={scan} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{scan.plant}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{shortId}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.disease_name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: s.dot }}>{scan.confidence.toFixed(1)}%</span>
        <StatusPill status={status} />
      </div>
    </Link>
  );
}

function HistoryCard({ scan }: { scan: ScanItem }) {
  const status = scanStatus(scan);
  const s = STATUS_META[status];
  const shortId = `#${scan.id.slice(0, 4).toUpperCase()}`;
  const time = new Date(scan.created_at).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
  return (
    <Link href={`/scan/${scan.id}`} style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", cursor: "pointer", display: "block" }}>
      <div style={{ position: "relative", aspectRatio: "1/1", background: "#0a3d2e" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl(scan.image_url)} alt={scan.plant} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <span style={{ position: "absolute", top: 8, left: 8, padding: "3px 7px", borderRadius: 5, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em", display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,255,255,0.10)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />{s.label}
        </span>
        <span style={{ position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: 5, background: "var(--accent)", color: "#1a1305", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700 }}>{scan.confidence.toFixed(1)}%</span>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{scan.plant}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{shortId}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scan.disease_name}</div>
        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span>{time}</span>
          <span>Toshkent</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 60, borderRadius: 16, background: "#fff", border: "1px dashed var(--line)", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 14px", background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-0.02em" }}>Hech narsa topilmadi</div>
      <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>Filtrlarni o&apos;zgartirib ko&apos;ring</div>
    </div>
  );
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [plant, setPlant] = useState("all");
  const [period, setPeriod] = useState<Period>("30");
  const [sort, setSort] = useState<Sort>("newest");
  const [selection, setSelection] = useState(new Set<string>());
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 320);
    return () => clearTimeout(t);
  }, [search]);

  async function loadScans() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "200",
        period_days: period,
        sort,
      });
      if (searchDebounced) params.set("q", searchDebounced);
      if (plant !== "all") params.set("plant", plant);
      const data = await apiFetch<ScanItem[]>(`/api/scans/?${params.toString()}`);
      setScans(data);
      setSelection(new Set());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScans().catch(() => setLoading(false));
  }, [period, sort, plant, searchDebounced]);

  const filterCounts = {
    all: scans.length,
    healthy: scans.filter(s => s.is_healthy).length,
    diseased: scans.filter(s => !s.is_healthy && s.confidence >= 70).length,
    lowconf: scans.filter(s => s.confidence < 70).length,
  };

  const filtered = scans.filter(s => {
    if (filter === "healthy" && !s.is_healthy) return false;
    if (filter === "diseased" && (s.is_healthy || s.confidence < 70)) return false;
    if (filter === "lowconf" && s.confidence >= 70) return false;
    if (search && !s.plant.toLowerCase().includes(search.toLowerCase()) && !s.disease_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, ScanItem[]> = {};
  filtered.forEach(s => {
    const g = dateGroup(s.created_at);
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(s);
  });

  const toggleSel = (id: string) => {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelection(next);
  };

  const FILTERS: { k: Filter; label: string; color: string }[] = [
    { k: "all",      label: "Hammasi",      color: "#0a3d2e" },
    { k: "healthy",  label: "Sog'lom",      color: "#1f8a5b" },
    { k: "diseased", label: "Kasallangan",  color: "#d4a017" },
    { k: "lowconf",  label: "Past ishonch", color: "#9ca3af" },
  ];
  const plantOptions = Array.from(new Set(scans.map(s => s.plant))).sort((a, b) => a.localeCompare(b));

  async function deleteSelected() {
    if (selection.size === 0) return;
    const ids = Array.from(selection);
    await apiFetch<{ deleted: number }>("/api/scans/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
    await loadScans();
  }

  return (
    <Shell
      title="Tarix"
      breadcrumb="Bosh sahifa · Tarix"
      rightSlot={
        <button style={{ height: 40, padding: "0 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          Eksport
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Filter bar */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map(f => {
                const active = filter === f.k;
                return (
                  <button key={f.k} onClick={() => setFilter(f.k)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: active ? "var(--primary)" : "transparent", color: active ? "#fff" : "var(--ink-2)", border: `1px solid ${active ? "var(--primary)" : "var(--line)"}`, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#84cc16" : f.color }} />
                    {f.label}
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: active ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>{filterCounts[f.k]}</span>
                  </button>
                );
              })}
            </div>
            {!mobile && (
              <div style={{ display: "inline-flex", padding: 3, borderRadius: 10, background: "var(--paper)", border: "1px solid var(--line)" }}>
                {([["list", "Ro'yxat"], ["grid", "Galereya"]] as [View, string][]).map(([k, label]) => {
                  const active = view === k;
                  return (
                    <button key={k} onClick={() => setView(k)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? "#fff" : "transparent", color: active ? "var(--ink)" : "var(--muted)", boxShadow: active ? "0 1px 2px rgba(10,31,21,0.06)" : "none", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500 }}>
                      {k === "list"
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                      }
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search + selects */}
          {!mobile && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tahlil yoki o'simlik qidirish…" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)" }} />
              </div>
              <SelectBtn label="O'simlik" value={plant === "all" ? "Barcha o'simliklar" : plant}>
                <select value={plant} onChange={e => setPlant(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, width: "100%" }}>
                  <option value="all">Barcha o&apos;simliklar</option>
                  {plantOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </SelectBtn>
              <SelectBtn label="Davr" value={period === "7" ? "So'nggi 7 kun" : period === "30" ? "So'nggi 30 kun" : period === "90" ? "So'nggi 90 kun" : "So'nggi 1 yil"}>
                <select value={period} onChange={e => setPeriod(e.target.value as Period)} style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, width: "100%" }}>
                  <option value="7">So&apos;nggi 7 kun</option>
                  <option value="30">So&apos;nggi 30 kun</option>
                  <option value="90">So&apos;nggi 90 kun</option>
                  <option value="365">So&apos;nggi 1 yil</option>
                </select>
              </SelectBtn>
              <SelectBtn label="Saralash" value={sort === "newest" ? "Yangidan" : sort === "oldest" ? "Eskidan" : sort === "confidence_desc" ? "Ishonch yuqori" : "Ishonch past"}>
                <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", fontWeight: 500, width: "100%" }}>
                  <option value="newest">Yangidan</option>
                  <option value="oldest">Eskidan</option>
                  <option value="confidence_desc">Ishonch yuqori</option>
                  <option value="confidence_asc">Ishonch past</option>
                </select>
              </SelectBtn>
            </div>
          )}

          {/* Summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px dashed var(--line)", fontSize: 12, color: "var(--muted)" }}>
            <span>
              ko&apos;rsatilmoqda <span style={{ color: "var(--ink)", fontWeight: 600 }}>{filtered.length}</span> dan {scans.length}
            </span>
            {selection.size > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{selection.size} tanlandi</span>
                <button style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500 }}>Yuklab olish</button>
                <button onClick={() => deleteSelected().catch(() => {})} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: "#b91c1c" }}>O&apos;chirish</button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ color: "var(--muted)", padding: 40, textAlign: "center" }}>Yuklanmoqda…</div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : mobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {GROUP_ORDER.map(g => grouped[g] ? (
              <div key={g}>
                <GroupHeader title={GROUP_LABELS[g]} count={grouped[g].length} />
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden" }}>
                  {grouped[g].map(scan => <HistoryRowMobile key={scan.id} scan={scan} />)}
                </div>
              </div>
            ) : null)}
          </div>
        ) : view === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {GROUP_ORDER.map(g => grouped[g] ? (
              <div key={g}>
                <GroupHeader title={GROUP_LABELS[g]} count={grouped[g].length} />
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden" }}>
                  {grouped[g].map((scan, i) => (
                    <HistoryRow key={scan.id} scan={scan} selected={selection.has(scan.id)} onToggle={() => toggleSel(scan.id)} isLast={i === grouped[g].length - 1} />
                  ))}
                </div>
              </div>
            ) : null)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {GROUP_ORDER.map(g => grouped[g] ? (
              <div key={g}>
                <GroupHeader title={GROUP_LABELS[g]} count={grouped[g].length} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                  {grouped[g].map(scan => <HistoryCard key={scan.id} scan={scan} />)}
                </div>
              </div>
            ) : null)}
          </div>
        )}
      </div>
    </Shell>
  );
}

function SelectBtn({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", padding: "7px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", gap: 1, minWidth: 140 }}>
      <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".10em" }}>{label}</span>
      {children ?? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
          {value}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      )}
    </div>
  );
}
