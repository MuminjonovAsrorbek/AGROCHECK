"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Mode = "signin" | "signup";
type Lang = "UZ" | "EN";

const T = {
  UZ: { welcomeBack: "Xush kelibsiz", createAccount: "Hisob yaratish", signIn: "Kirish", signUp: "Ro'yxatdan o'tish", email: "Email", password: "Parol", fullName: "To'liq ism", phone: "Telefon", forgot: "Parolni unutdingizmi?", or: "yoki", tagline: "Bargdagi kasallikni 3 soniyada aniqlang", haveAccount: "Hisobingiz bormi?", noAccount: "Hisobingiz yo'qmi?" },
  EN: { welcomeBack: "Welcome back", createAccount: "Create an account", signIn: "Sign in", signUp: "Sign up", email: "Email", password: "Password", fullName: "Full name", phone: "Phone", forgot: "Forgot password?", or: "or", tagline: "Detect leaf disease in 3 seconds", haveAccount: "Already have an account?", noAccount: "No account yet?" },
};

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [lang, setLang] = useState<Lang>("UZ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const t = T[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        const data = await apiFetch<{ access_token: string; refresh_token: string }>("/api/auth/register", {
          method: "POST", body: JSON.stringify({ email, password, full_name: fullName, phone: phone || undefined }),
        });
        login(data.access_token, data.refresh_token);
      } else {
        const data = await apiFetch<{ access_token: string; refresh_token: string }>("/api/auth/login", {
          method: "POST", body: JSON.stringify({ email, password }),
        });
        login(data.access_token, data.refresh_token);
      }
      router.push("/scan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle: React.CSSProperties = { height: 50, width: "100%", padding: "0 14px", borderRadius: 12, border: "1px solid var(--line)", fontFamily: "var(--sans)", fontSize: 15, color: "var(--ink)", outline: "none", background: "#fff" };
  const btnPrimary: React.CSSProperties = { height: 50, width: "100%", borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "var(--sans)", fontSize: 15, fontWeight: 600, cursor: "pointer" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh" }}>
      {/* Left — Form */}
      <div style={{ background: "#fff", display: "flex", flexDirection: "column", padding: 44 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: "var(--primary-soft)" }}>
            {(["signin", "signup"] as Mode[]).map((m, i) => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 18px", borderRadius: 999, border: "none", cursor: "pointer", background: mode === m ? "var(--primary)" : "transparent", color: mode === m ? "#fff" : "var(--primary)", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600 }}>
                {i === 0 ? t.signIn : t.signUp}
              </button>
            ))}
          </div>
          <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: "rgba(10,31,21,.05)", border: "1px solid rgba(10,31,21,.08)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".04em" }}>
            {(["UZ", "EN"] as Lang[]).map(l => (
              <div key={l} onClick={() => setLang(l)} style={{ padding: "5px 10px", borderRadius: 999, cursor: "pointer", background: lang === l ? "var(--primary)" : "transparent", color: lang === l ? "#fff" : "var(--muted)" }}>{l}</div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, alignSelf: "center", width: "100%" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 44, letterSpacing: "-0.02em", marginBottom: 8 }}>{mode === "signup" ? t.createAccount : t.welcomeBack}</h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
            {mode === "signup" && <input placeholder={t.fullName} value={fullName} onChange={e => setFullName(e.target.value)} required style={fieldStyle} />}
            <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} required style={fieldStyle} />
            {mode === "signup" && <input type="tel" placeholder={t.phone} value={phone} onChange={e => setPhone(e.target.value)} style={fieldStyle} />}
            <input type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} required style={fieldStyle} />
            {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}
            <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "..." : mode === "signup" ? t.signUp : t.signIn}</button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--muted)" }}>{t.or}</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`} style={{ flex: 1, height: 50, borderRadius: 12, border: "1px solid var(--line)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Google</a>
            <button style={{ flex: 1, height: 50, borderRadius: 12, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Telegram</button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
          {mode === "signup" ? t.haveAccount : t.noAccount}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {mode === "signup" ? t.signIn : t.signUp}
          </button>
        </p>
      </div>

      {/* Right — Brand Panel */}
      <div style={{ background: "linear-gradient(155deg,#0a3d2e,#08321a,#051d11)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 44, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "auto -120px -120px auto", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.35),transparent 60%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <Wordmark color="#fff" size={20} />
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: 460 }}>{t.tagline}</h2>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, marginTop: 12, maxWidth: 420, lineHeight: 1.5 }}>
            {lang === "UZ" ? "Suratga oling — sun'iy intellekt qolganini bajaradi" : "Snap a photo — let our AI handle the rest"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[{ v: "142K", l: lang === "UZ" ? "Aniqlangan kasalliklar" : "Diseases detected" }, { v: "38K", l: lang === "UZ" ? "Foydalanuvchilar" : "Active users" }, { v: "97.4%", l: lang === "UZ" ? "Aniqlik" : "Accuracy" }].map(m => (
            <div key={m.l}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--accent)", letterSpacing: "-0.02em" }}>{m.v}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
