"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      setLoading(false);
      return;
    }

    // refresh() re-evalúa el middleware con la sesión ya creada
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "#888",
            }}
          >
            Panel administrativo
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem,5vw,2.6rem)",
              lineHeight: "1",
              marginTop: "12px",
            }}
          >
            C Digital
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={fieldLabel}>Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={inputStyle}
              placeholder="tu@correo.com"
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={fieldLabel}>Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p style={{ color: "#ff6b6b", fontSize: "13px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "14px",
              background: loading ? "#333" : "#fff",
              color: loading ? "#999" : "#0a0a0a",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              transition: "opacity .2s",
            }}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}

const fieldLabel: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "#888",
};

const inputStyle: React.CSSProperties = {
  padding: "13px 15px",
  background: "#141414",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "15px",
  outline: "none",
};
