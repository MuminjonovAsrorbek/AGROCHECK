"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function CallbackInner() {
  const params = useSearchParams();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");
    if (access && refresh) {
      login(access, refresh);
      router.replace("/scan");
    } else {
      router.replace("/auth");
    }
  }, []);

  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--sans)", color: "var(--muted)" }}>Yuklanmoqda…</div>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Yuklanmoqda…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
