"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Mode = "signin" | "signup";
type Lang = "UZ" | "EN";

const T = {
  UZ: {
    welcomeBack: "Xush kelibsiz",
    signInSub: "Hisobingizga kirib o'simlik kasalliklarini aniqlashda davom eting",
    createAccount: "Hisob yaratish",
    createSub: "Bir necha soniyada ro'yxatdan o'ting va birinchi tahlilni boshlang",
    signIn: "Tizimga kirish",
    signUp: "Ro'yxatdan o'tish",
    email: "Email manzil",
    password: "Parol",
    fullName: "To'liq ism",
    phone: "Telefon raqam",
    forgot: "Parolni unutdingizmi?",
    rememberMe: "Meni eslab qol",
    or: "yoki",
    haveAccount: "Hisobingiz bormi?",
    noAccount: "Hisobingiz yo'qmi?",
    agree1: "Ro'yxatdan o'tish orqali",
    agree2: "foydalanish shartlari",
    agree3: "va",
    agree4: "maxfiylik siyosati",
    agree5: "ga roziman",
    aiBadge: "AI bilan ishlaydi",
    tagline: "Bargdagi kasallikni 3 soniyada aniqlang",
    sub1: "Suratga oling — sun'iy intellekt qolganini bajaradi",
    metric1: "Aniqlangan kasalliklar",
    metric2: "Faol foydalanuvchilar",
    metric3: "Aniqlik darajasi",
  },
  EN: {
    welcomeBack: "Welcome back",
    signInSub: "Log in to continue diagnosing plant diseases",
    createAccount: "Create an account",
    createSub: "Sign up in seconds and run your first analysis",
    signIn: "Sign in",
    signUp: "Sign up",
    email: "Email address",
    password: "Password",
    fullName: "Full name",
    phone: "Phone number",
    forgot: "Forgot password?",
    rememberMe: "Remember me",
    or: "or",
    haveAccount: "Already have an account?",
    noAccount: "No account yet?",
    agree1: "By signing up you agree to our",
    agree2: "terms of service",
    agree3: "and",
    agree4: "privacy policy",
    agree5: "",
    aiBadge: "AI-powered",
    tagline: "Detect leaf disease in 3 seconds",
    sub1: "Snap a photo — let our AI handle the rest",
    metric1: "Diseases detected",
    metric2: "Active users",
    metric3: "Accuracy rate",
  },
};

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC04" d="M3.95 10.7a5.41 5.41 0 0 1 0-3.4V4.97H.98a9 9 0 0 0 0 8.06l2.97-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}
function IconTelegram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path fill="#fff" d="M5.5 11.6 17 7.1c.6-.2 1.1.1 1 .9l-2 9.2c-.1.6-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-2.8 5.2-4.7c.2-.2 0-.3-.3-.1L8.6 13l-2.7-.8c-.6-.2-.6-.6.1-.9Z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2.5">
      <path d="M5 12l5 5 9-9" />
    </svg>
  );
}

function Field({
  label, type = "text", placeholder, icon, value, onChange, autoFocus,
}: {
  label: string; type?: string; placeholder?: string;
  icon?: React.ReactNode; value: string; onChange: (v: string) => void; autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block" }}>
      <div style={{
        fontSize: 12, fontWeight: 500, letterSpacing: "0.01em",
        color: "var(--muted)", marginBottom: 6,
        fontFamily: "var(--mono)", textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 10,
        background: "#fff",
        border: `1px solid ${focus ? "var(--primary)" : "var(--line)"}`,
        borderRadius: 12, padding: "0 14px", height: 50,
        transition: "border-color .15s ease, box-shadow .15s ease",
        boxShadow: focus ? "0 0 0 4px rgba(10,61,46,0.08)" : "none",
      }}>
        {icon && <span style={{ color: "var(--muted)", display: "inline-flex" }}>{icon}</span>}
        <input
          type={type} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)}
          autoFocus={autoFocus}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--sans)", fontSize: 15, color: "var(--ink)", height: "100%",
          }}
        />
      </div>
    </label>
  );
}

function V1ScanCard() {
  return (
    <div style={{
      width: 320, padding: 14,
      borderRadius: 18, background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(8px)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        position: "relative", height: 150, borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(135deg, #1d4421, #0a3d2e)",
      }}>
        <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <pattern id="leaf-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="3" height="6" fill="#84cc16" opacity="0.32" />
              <rect x="3" width="3" height="6" fill="#84cc16" opacity="0.18" />
            </pattern>
          </defs>
          <ellipse cx="160" cy="75" rx="120" ry="50" fill="url(#leaf-stripes)" />
          <path d="M40 75 Q160 30 280 75 Q160 120 40 75 Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
          <line x1="40" y1="50" x2="280" y2="50" stroke="#d4a017" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="200" cy="65" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="200" cy="65" r="3" fill="#fbbf24" />
        </svg>
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.4)",
          fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff",
        }}>SCAN · 03</div>
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          padding: "4px 8px", borderRadius: 6, background: "rgba(212,160,23,0.9)", color: "#1a1305",
          fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
        }}>97.4% match</div>
      </div>
      <div style={{ padding: "12px 4px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Detected
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: "#fff" }}>Tomato leaf · Early Blight</div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(132,204,22,0.18)", display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(132,204,22,0.35)",
        }}>
          <IconCheck />
        </div>
      </div>
    </div>
  );
}

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
  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isSignup) {
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh", background: "#fff" }}>

      {/* Left — Form */}
      <div style={{ background: "#fff", height: "100%", display: "flex", flexDirection: "column", padding: 44 }}>

        {/* Header: mode tabs + lang switch */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* ModeTabs */}
          <div style={{
            display: "inline-flex", padding: 4, borderRadius: 999,
            background: "var(--primary-soft)", border: "1px solid rgba(10,61,46,0.08)",
          }}>
            {(["signin", "signup"] as Mode[]).map((m, i) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "8px 18px", borderRadius: 999, border: "none", cursor: "pointer",
                fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
                background: mode === m ? "var(--primary)" : "transparent",
                color: mode === m ? "#fff" : "var(--primary)",
                transition: "all .15s ease",
              }}>
                {i === 0 ? t.signIn : t.signUp}
              </button>
            ))}
          </div>
          {/* LangSwitch */}
          <div style={{
            display: "inline-flex", padding: 3, borderRadius: 999,
            background: "rgba(10,31,21,0.05)", border: "1px solid rgba(10,31,21,0.08)",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.04em",
          }}>
            {(["UZ", "EN"] as Lang[]).map(l => (
              <div key={l} onClick={() => setLang(l)} style={{
                padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                background: lang === l ? "var(--primary)" : "transparent",
                color: lang === l ? "#fff" : "var(--muted)",
                transition: "all .15s ease",
              }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Center: form body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, alignSelf: "center", width: "100%" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.05,
              margin: 0, letterSpacing: "-0.02em", color: "var(--ink)",
            }}>
              {isSignup ? t.createAccount : t.welcomeBack}
            </h1>
            <p style={{ margin: "10px 0 0", color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>
              {isSignup ? t.createSub : t.signInSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isSignup && (
              <Field label={t.fullName} placeholder="Karim Yusupov" icon={<IconUser />}
                value={fullName} onChange={setFullName} />
            )}
            <Field label={t.email} type="email" placeholder="siz@example.com" icon={<IconMail />}
              value={email} onChange={setEmail} />
            {isSignup && (
              <Field label={t.phone} placeholder="+998 90 123 45 67" icon={<IconPhone />}
                value={phone} onChange={setPhone} />
            )}
            <Field label={t.password} type="password" placeholder="••••••••" icon={<IconLock />}
              value={password} onChange={setPassword} />

            {!isSignup && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -2 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
                  {t.rememberMe}
                </label>
                <a href="#" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{t.forgot}</a>
              </div>
            )}

            {error && <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>{error}</p>}

            <div style={{ marginTop: 6 }}>
              <button type="submit" disabled={loading} style={{
                background: "var(--primary)", color: "#fff", border: "1px solid var(--primary)",
                height: 50, padding: "0 18px", borderRadius: 12,
                fontFamily: "var(--sans)", fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "100%", opacity: loading ? 0.7 : 1, transition: "opacity .15s",
              }}>
                {loading ? "..." : isSignup ? t.signUp : t.signIn}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              <span style={{ fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>
                {t.or}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>

            {/* OAuth buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`} style={{
                flex: 1, height: 50, borderRadius: 12, border: "1px solid var(--line)",
                background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, fontSize: 14, fontWeight: 600, color: "var(--ink)", textDecoration: "none",
                cursor: "pointer",
              }}>
                <IconGoogle /> <span>Google</span>
              </a>
              <button type="button" style={{
                flex: 1, height: 50, borderRadius: 12, border: "1px solid var(--line)",
                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "var(--ink)",
              }}>
                <IconTelegram /> <span>Telegram</span>
              </button>
            </div>

            {isSignup && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
                {t.agree1}{" "}
                <a href="#" style={{ color: "var(--primary)" }}>{t.agree2}</a>{" "}
                {t.agree3}{" "}
                <a href="#" style={{ color: "var(--primary)" }}>{t.agree4}</a>
                {t.agree5 ? ` ${t.agree5}` : ""}
              </p>
            )}
          </form>
        </div>

        {/* Footer toggle */}
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
          {isSignup ? t.haveAccount : t.noAccount}{" "}
          <button
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            {isSignup ? t.signIn : t.signUp}
          </button>
        </div>
      </div>

      {/* Right — Brand Panel */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(155deg, #0a3d2e 0%, #08321a 55%, #051d11 100%)",
        color: "#fff", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 44,
      }}>
        {/* Ambient glow — gold bottom-right */}
        <div style={{
          position: "absolute", inset: "auto -120px -120px auto", width: 440, height: 440,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(212,160,23,0.35), rgba(212,160,23,0) 60%)",
          filter: "blur(10px)", pointerEvents: "none",
        }} />
        {/* Ambient glow — green top-left */}
        <div style={{
          position: "absolute", inset: "-160px auto auto -160px", width: 520, height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(132,204,22,0.18), rgba(132,204,22,0) 60%)",
          filter: "blur(20px)", pointerEvents: "none",
        }} />
        {/* Grid pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
          <defs>
            <pattern id="g1" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" stroke="#fff" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>

        {/* Header: wordmark + AI badge */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark color="#fff" size={20} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
            fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16", boxShadow: "0 0 12px #84cc16" }} />
            {t.aiBadge}
          </span>
        </div>

        {/* AI scan card + tagline */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          <V1ScanCard />
          <div>
            <div style={{
              fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em",
              color: "#fff", maxWidth: 460,
            }}>
              {t.tagline}
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginTop: 12, maxWidth: 420, lineHeight: 1.5 }}>
              {t.sub1}
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ position: "relative", display: "flex", gap: 28 }}>
          {[
            { v: "142K", l: t.metric1 },
            { v: "38K", l: t.metric2 },
            { v: "97.4%", l: t.metric3 },
          ].map(m => (
            <div key={m.l}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {m.v}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
