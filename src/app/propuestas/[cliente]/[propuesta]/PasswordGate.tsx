"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Formulario de contraseña de una propuesta. Al validar, el servidor emite la
 * cookie de acceso y registra la lectura; el refresh vuelve a renderizar la
 * página ya desbloqueada.
 */
export default function PasswordGate({
  proposalId,
  title,
}: {
  proposalId: string;
  title: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposalId, password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo validar.");
    } catch {
      setError("Fallo de red: inténtalo de nuevo.");
    }
    setBusy(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        color: "#f2f2f2",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          display: "grid",
          gap: 14,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 12, letterSpacing: 2, color: "#888" }}>
          PROPUESTA PRIVADA
        </span>
        <h1 style={{ fontSize: 22, margin: 0 }}>{title}</h1>
        <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
          Ingresa la contraseña que te compartimos para ver la propuesta.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          placeholder="Contraseña"
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#161616",
            color: "#f2f2f2",
            fontSize: 15,
            textAlign: "center",
          }}
        />
        <button
          type="submit"
          disabled={busy || !password}
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "none",
            background: "#f2f2f2",
            color: "#0a0a0a",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            opacity: busy || !password ? 0.6 : 1,
          }}
        >
          {busy ? "Verificando…" : "Ver propuesta"}
        </button>
        {error && (
          <p style={{ color: "#ff8080", fontSize: 13, margin: 0 }}>{error}</p>
        )}
      </form>
    </main>
  );
}
