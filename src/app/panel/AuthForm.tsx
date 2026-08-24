"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Registro de clientes para el panel. El mismo formulario sirve para el enlace
 * público y para invitaciones; si llega un correo en la URL se deja integrado
 * para que el cliente solo complete sus datos y contraseña.
 */
export default function AuthForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const router = useRouter();
  const lockedEmail = initialEmail.trim().toLowerCase();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(lockedEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/panel-registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        password,
        passwordConfirm,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "No se pudo completar el registro.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      setError("Cuenta creada. Inicia sesión desde /login.");
      setLoading(false);
      return;
    }

    // refresh() re-evalúa el middleware con la sesión ya creada
    router.replace("/panel");
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
        padding: "24px 18px",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "#888",
            }}
          >
            Panel de cliente
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
          <div style={rowStyle}>
            <label style={fieldWrap}>
              <span style={fieldLabel}>Nombre</span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                style={inputStyle}
                placeholder="Nombre"
                maxLength={80}
              />
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Apellido</span>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                style={inputStyle}
                placeholder="Apellido"
                maxLength={80}
              />
            </label>
          </div>

          <label style={fieldWrap}>
            <span style={fieldLabel}>Número de teléfono</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              style={inputStyle}
              placeholder="809-000-0000"
              maxLength={40}
            />
          </label>

          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span style={fieldLabel}>Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={Boolean(lockedEmail)}
              autoComplete="email"
              style={{
                ...inputStyle,
                ...(lockedEmail
                  ? { color: "#bdbdbd", background: "#101010" }
                  : null),
              }}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
              placeholder="••••••••"
              minLength={8}
            />
          </label>

          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span style={fieldLabel}>Confirmar contraseña</span>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
              placeholder="••••••••"
              minLength={8}
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
              minHeight: "48px",
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
        </form>

        <p
          style={{
            marginTop: "22px",
            fontSize: "13px",
            color: "#888",
            textAlign: "center",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "#5aa9ff", textDecoration: "none" }}>
            Inicia sesión
          </a>
        </p>
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

const fieldWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 0,
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const inputStyle: React.CSSProperties = {
  padding: "13px 15px",
  background: "#141414",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  color: "#fff",
  // 16px: por debajo de eso iOS hace zoom al enfocar el campo.
  fontSize: "16px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
