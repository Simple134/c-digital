"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

const PLAN_PREFILL: Record<string, { asunto: string; mensaje: string }> = {
  esencial: {
    asunto: "Estoy interesado en el Plan Aliado Esencial — $450/mes",
    mensaje:
      "Hola, me interesa el Plan Aliado Esencial ($450/mes · RD$26,000), que incluye:\n\n• Estrategia de contenido mensual\n• Gestión de 2 redes sociales\n• Producción de contenido estático y motion\n• Google My Business optimizado y posicionado en IAs\n• Reporte mensual\n\n¿Cuáles son los próximos pasos para comenzar?",
  },
  activo: {
    asunto: "Estoy interesado en el Plan Aliado Activo — $1,100/mes",
    mensaje:
      "Hola, me interesa el Plan Aliado Activo ($1,100/mes · RD$64,000), que incluye:\n\n• Estrategia de contenido personalizada\n• Gestión de 3 redes sociales\n• Producción audiovisual (reels y videos cortos)\n• Fotografía mensual\n• Presupuesto para influencer\n• SEO local + posicionamiento en Google e IAs\n• Automatizaciones de WhatsApp\n• Sesión estratégica mensual + reporte avanzado\n\n¿Cuáles son los próximos pasos para comenzar?",
  },
  estrategico: {
    asunto: "Estoy interesado en el Plan Aliado Estratégico — A medida",
    mensaje:
      "Hola, me interesa el Plan Aliado Estratégico (A medida · Según diagnóstico), que incluye:\n\n• Ecosistema digital completo\n• Google Ads\n• Desarrollo de sistema o app\n• CRM integrado\n• Reuniones quincenales\n• Cualquier combinación de servicios\n\n¿Cuáles son los próximos pasos para solicitar el diagnóstico?",
  },
};

interface FormState {
  nombre: string;
  email: string;
  empresa: string;
  asunto: string;
  mensaje: string;
  honeypot: string;
}

function ContactoContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    email: "",
    empresa: "",
    asunto: "",
    mensaje: "",
    honeypot: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [captcha, setCaptcha] = useState({ a: 1, b: 1, answer: 2, input: "", error: false });

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ a, b, answer: a + b, input: "", error: false });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan || !PLAN_PREFILL[plan]) return;
    setForm((prev) => ({ ...prev, ...PLAN_PREFILL[plan] }));
    setTimeout(() => {
      document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }, [searchParams]);

  useGSAP(
    () => {
      gsap.from("#heroTitle", { x: -100, opacity: 0, duration: 1.6, ease: "power4.out", delay: 0.2 });
      gsap.from("#contactOptions .option-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        });
      });
    },
    { scope: containerRef },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    if (parseInt(captcha.input) !== captcha.answer) {
      setCaptcha((prev) => ({ ...prev, error: true }));
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      Nombre: form.nombre || "nothing",
      Correo: form.email || "nothing",
      Empresa: form.empresa || "nothing",
      Asunto: form.asunto || "nothing",
      Mensaje: form.mensaje || "nothing",
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);
      const response = await fetch(`/api/contact-gestiono/52`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: submitData }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setForm({ nombre: "", email: "", empresa: "", asunto: "", mensaje: "", honeypot: "" });
        generateCaptcha();
        setShowModal(true);
        document.body.style.overflow = "hidden";
      } else {
        alert("Hubo un error al enviar el formulario. Por favor intenta de nuevo.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setForm({ nombre: "", email: "", empresa: "", asunto: "", mensaje: "", honeypot: "" });
        generateCaptcha();
        setShowModal(true);
        document.body.style.overflow = "hidden";
      } else {
        alert("Hubo un error al enviar el formulario. Por favor intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "";
  };

  return (
    <div ref={containerRef}>
      <Header dark />

      {/* Hero oscuro */}
      <section className="contact-hero">
        <div className="container">
          <h1 id="heroTitle">
            Hablemos <br /> de tu <span className="cursive">proyecto</span>
          </h1>
          <div className="contact-options" id="contactOptions">
            <a href="#form" className="option-item">
              <span className="option-label">¿Quieres escribirnos?</span>
              <span className="option-value">
                Formulario de contacto
                <span className="opt-arrow">→</span>
              </span>
            </a>
            <Link href="/contacto/agendar" className="option-item">
              <span className="option-label">¿Prefieres una reunión?</span>
              <span className="option-value">
                Agendar una consulta
                <span className="opt-arrow">→</span>
              </span>
            </Link>
            <a
              href="https://api.whatsapp.com/send/?phone=7867557025&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="option-item"
            >
              <span className="option-label">¿Tienes dudas rápidas?</span>
              <span className="option-value">
                Contactar al chat bot
                <span className="opt-arrow">→</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section id="form" className="contact-form-section">
        <div className="container">
          <div className="contact-form-grid">
            <div className="form-heading reveal-up">
              <p className="pricing-tag">Escríbenos</p>
              <h2>
                Permítenos <br /> ayudarte con <br /> tu próximo <br />{" "}
                <span className="cursive">proyecto.</span>
              </h2>
              <p>
                Cuéntanos tu idea y te respondemos en menos de 24 horas con una propuesta
                personalizada.
              </p>
            </div>

            <div className="reveal-up">
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {/* Honeypot anti-spam */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <input
                    type="text"
                    name="honeypot"
                    value={form.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      id="nombre"
                      name="nombre"
                      placeholder=" "
                      required
                      value={form.nombre}
                      onChange={handleChange}
                    />
                    <label htmlFor="nombre" className="form-label">
                      Nombre completo*
                    </label>
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-input"
                      id="email"
                      name="email"
                      placeholder=" "
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email" className="form-label">
                      Correo electrónico*
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    id="empresa"
                    name="empresa"
                    placeholder=" "
                    value={form.empresa}
                    onChange={handleChange}
                  />
                  <label htmlFor="empresa" className="form-label">
                    Empresa / Marca
                  </label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    id="asunto"
                    name="asunto"
                    placeholder=" "
                    required
                    value={form.asunto}
                    onChange={handleChange}
                  />
                  <label htmlFor="asunto" className="form-label">
                    ¿En qué podemos ayudarte?*
                  </label>
                </div>

                <div className="form-group">
                  <textarea
                    className="form-input"
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    placeholder=" "
                    required
                    value={form.mensaje}
                    onChange={handleChange}
                  />
                  <label htmlFor="mensaje" className="form-label">
                    Cuéntanos sobre tu proyecto*
                  </label>
                </div>

                {/* Captcha matemático */}
                <div className="captcha-group">
                  <span className="captcha-question">
                    Verificación: ¿Cuánto es {captcha.a} + {captcha.b}?
                  </span>
                  <input
                    type="number"
                    className="captcha-input"
                    placeholder="?"
                    aria-label="Respuesta de verificación"
                    value={captcha.input}
                    onChange={(e) =>
                      setCaptcha((prev) => ({ ...prev, input: e.target.value, error: false }))
                    }
                    required
                  />
                  {captcha.error && (
                    <span className="captcha-error" style={{ display: "inline" }}>
                      Respuesta incorrecta
                    </span>
                  )}
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    className="cta-btn submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando…" : "Enviar mensaje"}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="btn-icon"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de éxito */}
      <div
        className={`success-modal-overlay${showModal ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="success-modal">
          <div className="success-modal-check">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="success-modal-tag">Mensaje recibido</p>
          <h2>
            ¡Gracias por <br />
            <span className="cursive">escribirnos!</span>
          </h2>
          <p>
            Te respondemos en menos de 24 horas con una propuesta pensada para tu negocio. Mientras
            tanto, conoce más sobre lo que hacemos.
          </p>

          <div className="success-modal-divider" />

          <p className="success-modal-sub">Síguenos en redes</p>
          <div className="success-social-links">
            <a
              href="https://www.instagram.com/cdigitalestudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="success-social-link"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@cdigitalestudio"
              target="_blank"
              rel="noopener noreferrer"
              className="success-social-link"
            >
              YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/c-digital-estudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="success-social-link"
            >
              LinkedIn
            </a>
          </div>

          <div className="success-modal-actions">
            <Link href="/#portfolio" className="success-portfolio-btn">
              Ver trabajos recientes
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <button className="success-modal-close" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── Hero ── */
        .contact-hero {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          padding: 160px 0 100px;
        }

        .contact-hero h1 {
          font-size: clamp(3.5rem, 9vw, 9rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -3px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 80px;
        }

        .contact-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .option-item {
          text-decoration: none;
          color: inherit;
          padding: 40px 36px;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          transition: background 0.4s ease;
        }

        .option-item::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #00b3e8, #00c25f);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .option-item:hover::after {
          opacity: 0.06;
        }

        .option-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.4);
          display: block;
          position: relative;
          z-index: 1;
        }

        .option-value {
          font-size: clamp(1.1rem, 1.8vw, 1.5rem);
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .opt-arrow {
          font-size: 18px;
          background: linear-gradient(90deg, #00b3e8, #00c25f);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transform: translateX(0);
          transition: transform 0.3s ease;
        }

        .option-item:hover .opt-arrow {
          transform: translateX(6px);
        }

        .option-item:hover .option-value {
          background: linear-gradient(90deg, #00b3e8, #00c25f);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── Form Section ── */
        .contact-form-section {
          padding: 160px 0;
          background: #fff;
        }

        .contact-form-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 100px;
          align-items: start;
        }

        .form-heading {
          position: sticky;
          top: 40px;
        }

        .form-heading h2 {
          font-size: clamp(2.4rem, 4vw, 4.2rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        .form-heading p {
          font-size: 15px;
          line-height: 1.8;
          color: #888888;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-group {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 16px 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 16px;
          font-family: inherit;
          color: #111;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
          resize: none;
        }

        textarea.form-input {
          min-height: 120px;
        }

        .form-input:focus {
          outline: none;
          border-color: #000;
        }

        .form-label {
          position: absolute;
          top: 16px;
          left: 0;
          font-size: 15px;
          color: #888888;
          pointer-events: none;
          transition: all 0.25s ease;
        }

        .form-input:focus + .form-label,
        .form-input:not(:placeholder-shown) + .form-label {
          top: -10px;
          font-size: 11px;
          color: #000;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Captcha */
        .captcha-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .captcha-question {
          font-size: 14px;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
        }

        .captcha-input {
          width: 80px;
          padding: 10px 12px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 15px;
          font-family: inherit;
          text-align: center;
          background: transparent;
          transition: border-color 0.3s;
        }

        .captcha-input:focus {
          outline: none;
          border-color: #000;
        }

        .captcha-error {
          font-size: 12px;
          color: #e53e3e;
        }

        .form-submit-row {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .submit-btn {
          border: none;
          cursor: pointer;
          font-family: inherit;
          color: #000;
        }

        .submit-btn:hover {
          color: #fff;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* ── Modal de éxito ── */
        .success-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .success-modal-overlay.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .success-modal {
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 560px;
          width: 100%;
          padding: 56px 48px;
          text-align: center;
          transform: translateY(24px);
          transition: transform 0.4s ease;
        }

        .success-modal-overlay.is-open .success-modal {
          transform: translateY(0);
        }

        .success-modal-check {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00b3e8, #00c25f);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
        }

        .success-modal-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 16px;
        }

        .success-modal h2 {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -1px;
          color: #fff;
          margin-bottom: 16px;
        }

        .success-modal p {
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 40px;
        }

        .success-modal-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
          margin-bottom: 32px;
        }

        .success-modal-sub {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        .success-social-links {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 32px;
        }

        .success-social-link {
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: border-color 0.25s, color 0.25s;
          white-space: nowrap;
        }

        .success-social-link:hover {
          border-color: rgba(255, 255, 255, 0.5);
          color: #fff;
        }

        .success-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .success-portfolio-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(90deg, #00b3e8, #00c25f);
          padding: 15px 32px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .success-portfolio-btn:hover {
          opacity: 0.85;
        }

        .success-modal-close {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition: color 0.3s;
        }

        .success-modal-close:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .contact-options {
            grid-template-columns: 1fr;
          }
          .contact-form-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .form-heading {
            position: static;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .contact-form-section {
            padding: 80px 0;
          }
        }

        @media (max-width: 560px) {
          .success-modal {
            padding: 40px 24px;
          }
          .success-social-links {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default function ContactoPage() {
  return (
    <Suspense>
      <ContactoContent />
    </Suspense>
  );
}
