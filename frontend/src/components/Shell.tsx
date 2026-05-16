"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Logo";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { ReactNode } from "react";

type Lang = "UZ" | "EN";

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function NavIconScan({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--accent)" : "currentColor"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
      <path d="M7 12h10" />
    </svg>
  );
}
function NavIconHistory({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "rgba(255,255,255,.65)"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 8v4l3 2" />
    </svg>
  );
}
function NavIconStats({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "rgba(255,255,255,.65)"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 21V9M9 21V3M15 21v-7M21 21V12" />
    </svg>
  );
}
function NavIconLibrary({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "rgba(255,255,255,.65)"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h6v16H4zM14 4h6v16h-6z" />
    </svg>
  );
}
function NavIconUser({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "rgba(255,255,255,.65)"} strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function MobileNavIconHistory(_: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 8v4l3 2" />
    </svg>
  );
}
function MobileNavIconScan(_: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M7 12h10" />
    </svg>
  );
}
function MobileNavIconStats(_: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 21V9M9 21V3M15 21v-7M21 21V12" />
    </svg>
  );
}
function MobileNavIconProfile(_: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function MobileNavIconHome(_: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12 12 3l9 9v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

const MOBILE_NAV = [
  { key: "scan",      href: "/scan",      Icon: MobileNavIconHome },
  { key: "history",   href: "/history",   Icon: MobileNavIconHistory },
  { key: "scan_btn",  href: "/scan",      primary: true, Icon: MobileNavIconScan },
  { key: "dashboard", href: "/dashboard", Icon: MobileNavIconStats },
  { key: "profile",   href: "#",          Icon: MobileNavIconProfile },
];

function MobileTabbar({ pathname }: { pathname: string }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      padding: "10px 18px 24px",
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
      borderTop: "1px solid var(--line)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      zIndex: 100
    }}>
      {MOBILE_NAV.map(item => {
        const isActive = pathname.startsWith(item.href) && item.href !== "#";
        if (item.primary) {
          return (
            <Link key={item.key} href={item.href} style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "var(--primary)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 24px -8px rgba(10,61,46,0.4), 0 0 0 6px rgba(10,61,46,0.06)",
              marginTop: -16, flexShrink: 0
            }}>
              <item.Icon active={false} />
            </Link>
          );
        }
        return (
          <Link key={item.key} href={item.href} style={{
            width: 44, height: 44, borderRadius: 12,
            color: isActive ? "var(--primary)" : "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <item.Icon active={isActive} />
          </Link>
        );
      })}
    </nav>
  );
}

const NAV = [
  { key: "scan",      href: "/scan",      labelUZ: "Tahlil",     labelEN: "Scan",    Icon: NavIconScan,    },
  { key: "history",   href: "/history",   labelUZ: "Tarix",      labelEN: "History", Icon: NavIconHistory, },
  { key: "dashboard", href: "/dashboard", labelUZ: "Statistika", labelEN: "Stats",   Icon: NavIconStats,   },
  { key: "profile",   href: "/profile",   labelUZ: "Profil",     labelEN: "Profile", Icon: NavIconUser,    },
];

export function Shell({
  children, title, breadcrumb, rightSlot, lang = "UZ", onLangChange,
}: {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  rightSlot?: ReactNode;
  lang?: Lang;
  onLangChange?: (l: Lang) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const mobile = useMobile();
  const [scanTotal, setScanTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setScanTotal(null); return; }
    apiFetch<{ all_time_total: number }>("/api/stats/?range=365")
      .then(d => setScanTotal(d.all_time_total))
      .catch(() => {});
  }, [user]);

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--paper)", paddingBottom: 80 }}>
        <header style={{
          padding: "14px 18px",
          background: "#fff", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10
        }}>
          <div>
            {breadcrumb && <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 2 }}>{breadcrumb}</div>}
            <h1 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {rightSlot}
            {user && (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#84cc16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0a3d2e", fontSize: 12, flexShrink: 0 }}>
                {user.full_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>
        <main style={{ padding: "20px 16px", flex: 1 }}>{children}</main>
        <MobileTabbar pathname={pathname} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh", background: "var(--paper)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        background: "linear-gradient(180deg,#0a3d2e 0%,#06291e 100%)",
        color: "#fff", display: "flex", flexDirection: "column",
        padding: "22px 18px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: "auto -80px -120px auto", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.35),transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />

        <Wordmark color="#fff" size={18} />
        <div style={{ height: 28 }} />

        <div style={{ fontSize: 10, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.45)", padding: "0 10px 10px" }}>
          {lang === "UZ" ? "Menyu" : "Menu"}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const active = pathname.startsWith(item.href) && item.href !== "#";
            const label = lang === "UZ" ? item.labelUZ : item.labelEN;
            const badge = item.key === "history" && scanTotal !== null ? String(scanTotal) : null;
            return (
              <Link key={item.key} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px", borderRadius: 10, textDecoration: "none",
                fontSize: 14, fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "rgba(255,255,255,.65)",
                background: active ? "rgba(255,255,255,.10)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,.10)" : "1px solid transparent",
                position: "relative",
              }}>
                <item.Icon active={active} />
                <span>{label}</span>
                {badge && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontFamily: "var(--mono)",
                    padding: "2px 6px", borderRadius: 999,
                    background: active ? "var(--accent)" : "rgba(212,160,23,.18)",
                    color: active ? "#1a1305" : "var(--accent)",
                  }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", position: "relative" }}>
          <div style={{ padding: 14, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", marginBottom: 14 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 999, background: "rgba(132,204,22,.18)", color: "#bef264", fontSize: 10, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#84cc16" }} />
              Pro
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
              {lang === "UZ" ? "Cheksiz tahlil va PDF hisobotlar" : "Unlimited scans & PDF reports"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 4 }}>
              {lang === "UZ" ? "49 000 so'm / oy" : "$3.99 / month"}
            </div>
          </div>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,.04)" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#d4a017,#84cc16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0a3d2e", fontSize: 13 }}>
                {user.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "var(--mono)" }}>
                  {user.plan} · {user.scan_count_month}/10
                </div>
              </div>
              <button onClick={logout} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m8 9 4-4 4 4M8 15l4 4 4-4" /></svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--line)", background: "#fff", position: "sticky", top: 0, zIndex: 3 }}>
          <div>
            {breadcrumb && (
              <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
                {breadcrumb}
              </div>
            )}
            <h1 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {rightSlot}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input placeholder={lang === "UZ" ? "Qidirish…" : "Search…"} style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: 13, width: 160, background: "transparent" }} />
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", padding: "2px 5px", borderRadius: 4, border: "1px solid var(--line)" }}>⌘K</span>
            </div>
            <button style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 0 1-4 0" /></svg>
              <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", border: "2px solid #fff" }} />
            </button>
            {onLangChange && (
              <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: "rgba(10,31,21,.05)", border: "1px solid rgba(10,31,21,.08)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".04em" }}>
                {(["UZ", "EN"] as Lang[]).map(l => (
                  <div key={l} onClick={() => onLangChange(l)} style={{ padding: "5px 10px", borderRadius: 999, cursor: "pointer", background: lang === l ? "var(--primary)" : "transparent", color: lang === l ? "#fff" : "var(--muted)", transition: "all .15s" }}>{l}</div>
                ))}
              </div>
            )}
          </div>
        </header>
        <main style={{ padding: 32, flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
