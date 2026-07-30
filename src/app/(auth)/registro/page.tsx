"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/registro-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "No se pudo completar el registro.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError("Cuenta creada. Inicia sesión desde /login.");
      setLoading(false);
      return;
    }

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
            Crear cuenta
          </h1>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "10px" }}>
            Solo disponible para miembros del equipo dados de alta con su
            correo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
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

          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span style={fieldLabel}>Contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
              placeholder="Mínimo 8 caracteres"
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
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <a
            href="/login"
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </a>
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
