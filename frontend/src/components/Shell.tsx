"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Logo";
import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

const NAV = [
  { key: "scan",      href: "/scan",      label: "Tahlil" },
  { key: "history",   href: "/history",   label: "Tarix" },
  { key: "dashboard", href: "/dashboard", label: "Statistika" },
];

export function Shell({ children, title, breadcrumb }: { children: ReactNode; title: string; breadcrumb?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh", background: "var(--paper)" }}>
      {/* Sidebar */}
      <aside style={{ background: "linear-gradient(180deg,#0a3d2e,#06291e)", color: "#fff", display: "flex", flexDirection: "column", padding: "22px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "auto -80px -120px auto", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.35),transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />
        <Wordmark color="#fff" size={18} />
        <div style={{ height: 28 }} />
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.key} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#fff" : "rgba(255,255,255,.65)", background: active ? "rgba(255,255,255,.10)" : "transparent", border: active ? "1px solid rgba(255,255,255,.10)" : "1px solid transparent" }}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,.04)" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#84cc16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0a3d2e", fontSize: 13 }}>
                {user.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "var(--mono)" }}>{user.plan} · {user.scan_count_month}/10</div>
              </div>
              <button onClick={logout} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 12 }}>↩</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--line)", background: "#fff", position: "sticky", top: 0, zIndex: 3 }}>
          <div>
            {breadcrumb && <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>{breadcrumb}</div>}
            <h1 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1 }}>{title}</h1>
          </div>
        </header>
        <main style={{ padding: 32, flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
