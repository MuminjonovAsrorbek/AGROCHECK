"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Stats {
  total: number; all_time_total: number; healthy: number; diseased: number;
  avg_confidence: number; scan_count_month: number; plan_limit: number | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      <div style={{ padding: "6px 0" }}>{children}</div>
    </div>
  );
}

function Row({ label, value, hint, action, danger }: { label: string; value?: string; hint?: string; action?: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid var(--line)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: danger ? "#b91c1c" : "var(--ink)" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {value && <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>{value}</span>}
        {action}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--ink)" }}>{value}</div>
        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notif, setNotif] = useState(true);
  const [lang, setLang] = useState<"UZ" | "EN">("UZ");

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  useEffect(() => {
    apiFetch<Stats>("/api/stats/?range=365").then(setStats).catch(() => {});
  }, []);

  if (!user) return null;

  const initials = user.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const planLimit = stats?.plan_limit ?? 10;
  const usedPct = Math.min((user.scan_count_month / planLimit) * 100, 100);
  const healthyPct = stats?.total ? Math.round((stats.healthy / stats.total) * 100) : 0;

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  return (
    <Shell title="Profil" breadcrumb="Bosh sahifa · Profil">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* User card */}
          <div style={{ background: "linear-gradient(155deg,#0a3d2e,#06291a)", borderRadius: 22, padding: 28, position: "relative", overflow: "hidden", color: "#fff" }}>
            <div style={{ position: "absolute", inset: "auto -60px -80px auto", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.35),transparent 60%)", filter: "blur(20px)" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#84cc16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: "#0a3d2e", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editing ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      style={{ fontFamily: "var(--serif)", fontSize: 24, letterSpacing: "-0.02em", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 8, color: "#fff", padding: "4px 10px", outline: "none", width: 220 }}
                      autoFocus
                    />
                    <button onClick={() => setEditing(false)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#1a1305", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Saqlash</button>
                    <button onClick={() => { setFullName(user.full_name); setEditing(false); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.20)", background: "transparent", color: "rgba(255,255,255,.6)", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Bekor</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1 }}>{user.full_name}</h2>
                    <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 6, color: "rgba(255,255,255,.6)", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" /></svg>
                    </button>
                  </div>
                )}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 4, fontFamily: "var(--mono)" }}>{user.email}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "4px 10px", borderRadius: 999, background: "rgba(132,204,22,.18)", color: "#bef264", fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16" }} />
                  {user.plan === "free" ? "Bepul rejim" : "Pro rejim"}
                </div>
              </div>
            </div>
            <div style={{ position: "relative", marginTop: 22, padding: "16px 18px", background: "rgba(255,255,255,.07)", borderRadius: 14, border: "1px solid rgba(255,255,255,.10)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>Bu oyda foydalanish</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700 }}>{user.scan_count_month} / {planLimit}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.12)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${usedPct}%`, height: "100%", background: usedPct > 80 ? "#f87171" : "var(--accent)", borderRadius: 3, transition: "width .4s ease" }} />
              </div>
              {usedPct > 80 && (
                <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 6 }}>Limitga yaqinlashyapsiz — Pro rejimdagi cheksiz tahlilga o&apos;ting.</div>
              )}
            </div>
          </div>

          {/* Plan */}
          <Section title="Tarif rejimi">
            <Row
              label={user.plan === "free" ? "Bepul rejim" : "Pro rejim"}
              hint={user.plan === "free" ? "Oyiga 10 ta tahlil, asosiy funksiyalar" : "Cheksiz tahlil, PDF hisobotlar, ustunlik support"}
              value={user.plan === "free" ? "0 so'm/oy" : "49 000 so'm/oy"}
              action={user.plan === "free" ? (
                <button style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Pro ga o&apos;tish
                </button>
              ) : (
                <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>Faol</span>
              )}
            />
            {user.plan === "free" && (
              <div style={{ margin: "4px 22px 14px", padding: "14px 16px", borderRadius: 12, background: "rgba(10,61,46,.04)", border: "1px solid rgba(10,61,46,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Pro rejimdagi imtiyozlar</div>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
                    <li>Cheksiz tahlil</li>
                    <li>PDF hisobotlar yuklab olish</li>
                    <li>Batafsil kasallik tahlili</li>
                    <li>Mutaxassis bilan bog&apos;lanish</li>
                  </ul>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", color: "var(--primary)" }}>49 000</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>SO&apos;M / OY</div>
                </div>
              </div>
            )}
          </Section>

          {/* Settings */}
          <Section title="Sozlamalar">
            <Row
              label="Til / Language"
              hint="Interfeys tili"
              action={
                <div style={{ display: "inline-flex", padding: 3, borderRadius: 8, background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 11 }}>
                  {(["UZ", "EN"] as const).map(l => (
                    <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: lang === l ? "var(--primary)" : "transparent", color: lang === l ? "#fff" : "var(--muted)", fontFamily: "inherit", fontSize: "inherit", fontWeight: 500 }}>{l}</button>
                  ))}
                </div>
              }
            />
            <Row
              label="Bildirishnomalar"
              hint="Kasallik aniqlanganda xabar yuborish"
              action={
                <button onClick={() => setNotif(n => !n)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: notif ? "var(--primary)" : "rgba(10,31,21,.12)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: notif ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                </button>
              }
            />
            <Row
              label="Maxfiylik"
              hint="Ma'lumotlaringiz faqat siz uchun ko'rinadi"
              value="Himoyalangan"
              action={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M9 5l7 7-7 7" /></svg>}
            />
          </Section>

          {/* Account */}
          <Section title="Hisob">
            <Row
              label="Hisobni o'chirish"
              hint="Barcha ma'lumotlar va tahlillar o'chiriladi"
              danger
              action={
                <button style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(185,28,28,.25)", background: "rgba(185,28,28,.05)", color: "#b91c1c", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  O&apos;chirish
                </button>
              }
            />
            <div style={{ padding: "14px 22px" }}>
              <button onClick={handleLogout} style={{ width: "100%", height: 46, borderRadius: 12, border: "1px solid var(--line-strong)", background: "#fff", color: "var(--ink)", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                Tizimdan chiqish
              </button>
            </div>
          </Section>

          <div style={{ textAlign: "center", padding: "4px 0 12px", fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", letterSpacing: ".06em" }}>
            AGROCHECK v1.0 · © 2025 · Barcha huquqlar himoyalangan
          </div>
        </div>

        {/* ── Right column: stats ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
          {stats ? (
            <>
              <StatCard label="Jami tahlillar" value={String(stats.all_time_total)} color="#0a3d2e"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M7 12h10" /></svg>}
              />
              <StatCard label="Sog'lom natija" value={`${healthyPct}%`} color="#1f8a5b"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22c1-3.5 6-5 6-11a6 6 0 1 0-12 0c0 6 5 7.5 6 11Z" /></svg>}
              />
              <StatCard label="O'rta ishonch" value={stats.avg_confidence ? `${stats.avg_confidence.toFixed(1)}%` : "—"} color="#d4a017"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" /></svg>}
              />
              <StatCard label="Bu oy tahlillar" value={`${stats.scan_count_month}/${stats.plan_limit ?? '∞'}`} color="#8b5cf6"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
              />
            </>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Yuklanmoqda…</div>
          )}
        </div>

      </div>
    </Shell>
  );
}
