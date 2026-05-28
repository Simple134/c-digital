"use client";
import React, { useState } from "react";
import Link from "next/link";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const TIME_SLOTS = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
];

const ArrowRight = () => (
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
);

const CheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function AgendarPage() {
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [digital, setDigital] = useState<string[]>([]);
  const [challenge, setChallenge] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState("");

  // Calendar
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const goNext = (from: number) => {
    if (from === 1) {
      if (!name.trim() || !role.trim() || !email.trim() || !phone.trim()) {
        alert("Por favor completa todos los campos de contacto.");
        return;
      }
    }
    if (from === 2) {
      if (!business.trim() || !sector || !stage) {
        alert("Por favor completa el nombre, sector y etapa del negocio.");
        return;
      }
    }
    if (from === 3) {
      if (!challenge) {
        alert("Por favor selecciona tu principal desafío.");
        return;
      }
    }
    if (from === 4) {
      if (!selectedDate || !selectedTime) {
        alert("Por favor selecciona una fecha y un horario.");
        return;
      }
    }
    setStep(from + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = (from: number) => {
    setStep(from - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calendar logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const calPrev = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const calNext = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const getCalSelectedDisplay = () => {
    if (selectedDate && selectedTime) {
      return (
        <>
          <strong>
            {DAYS_ES[selectedDate.getDay()]}, {selectedDate.getDate()} de{" "}
            {MONTHS_ES[selectedDate.getMonth()]} — {selectedTime}
          </strong>
        </>
      );
    }
    if (selectedDate) {
      return (
        <>
          {DAYS_ES[selectedDate.getDay()]}, {selectedDate.getDate()} de{" "}
          {MONTHS_ES[selectedDate.getMonth()]} —{" "}
          <span style={{ opacity: 0.5 }}>selecciona un horario</span>
        </>
      );
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget) {
      alert("Por favor selecciona un rango de presupuesto.");
      return;
    }
    setIsSubmitting(true);

    const submitData = {
      Nombre: name || "nothing",
      Correo: email || "nothing",
      Negocio: business || "nothing",
      Posicion: role || "nothing",
      Whatsapp: phone || "nothing",
      Sector: sector || "nothing",
      "Etapa del negocio": stage || "nothing",
      "Que tienes actualmente": digital.join(", ") || "nothing",
      "Desafio actual": challenge || "nothing",
      Servicios: services.join(", ") || "nothing",
      Presupuesto: budget || "nothing",
      "Informacion extra": note || "nothing",
      "Dia de reunion":
        selectedDate && selectedTime
          ? `${selectedDate.toLocaleDateString("es-DO")} ${selectedTime}`
          : "nothing",
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);
      const response = await fetch(`/api/contact-gestiono/51`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: submitData }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        setConfirmed(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(
          "Hubo un error al enviar el formulario. Por favor intenta de nuevo.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setConfirmed(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(
          "Hubo un error al enviar el formulario. Por favor intenta de nuevo.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #0d0d0d; }

        .book-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 48px;
          background: rgba(13,13,13,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .book-back {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 2px; color: rgba(255,255,255,0.4); text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.3s;
        }
        .book-back:hover { color: #fff; }

        .book-layout {
          display: grid; grid-template-columns: 420px 1fr; min-height: 100vh;
        }
        .book-info {
          position: sticky; top: 0; height: 100vh;
          padding: 120px 48px 48px;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; justify-content: center;
          overflow-y: auto;
        }
        .book-tag {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 4px; color: rgba(255,255,255,0.3);
          margin-bottom: 20px; display: block;
        }
        .book-title {
          font-size: clamp(2.4rem, 3.5vw, 3.6rem);
          font-weight: 800; line-height: 1; letter-spacing: -2px; margin-bottom: 24px;
          color: #fff;
        }
        .book-desc {
          font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.45); margin-bottom: 40px;
        }
        .book-discover-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 20px;
        }
        .book-perks { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; padding: 0; }
        .book-perks li {
          font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6);
          display: flex; align-items: flex-start; gap: 10px; line-height: 1.5;
        }
        .book-perks li::before {
          content: '✓'; font-weight: 800;
          background: linear-gradient(90deg,#00b3e8,#00c25f);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; flex-shrink: 0; margin-top: 1px;
        }
        .book-duration {
          display: flex; align-items: center; gap: 8px; margin-top: 0;
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.35);
        }
        .book-note {
          font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.7;
          padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: 28px;
        }

        .book-form-panel { padding: 120px 80px 80px; max-width: 760px; }

        .book-progress { display: flex; gap: 6px; margin-bottom: 56px; }
        .book-progress span { height: 2px; flex: 1; background: rgba(255,255,255,0.1); transition: background 0.4s ease; }
        .book-progress span.done { background: linear-gradient(90deg,#00b3e8,#00c25f); }

        .step-tag {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 3px; color: rgba(255,255,255,0.25); margin-bottom: 16px;
        }
        .step-heading {
          font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800;
          line-height: 1.05; letter-spacing: -1px; margin-bottom: 44px; color: #fff;
        }
        .field-block { display: flex; flex-direction: column; gap: 32px; margin-bottom: 48px; }
        .field-group { position: relative; }
        .field-label-top {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.5px; color: rgba(255,255,255,0.35); margin-bottom: 16px; display: block;
        }
        .field-input {
          width: 100%; padding: 16px 0; background: transparent;
          border: none; border-bottom: 1px solid rgba(255,255,255,0.12);
          font-size: 16px; font-family: inherit; color: #fff; transition: border-color 0.3s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-input:focus { outline: none; border-color: rgba(255,255,255,0.5); }
        textarea.field-input { resize: none; min-height: 110px; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

        .phone-row {
          display: flex; align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.12); gap: 10px;
          transition: border-color 0.3s;
        }
        .phone-row:focus-within { border-color: rgba(255,255,255,0.5); }
        .phone-prefix {
          font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.4);
          white-space: nowrap; padding: 16px 0; flex-shrink: 0;
        }
        .phone-row .field-input { border-bottom: none; flex: 1; }

        .opt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .opt-card {
          border: 1px solid rgba(255,255,255,0.09); padding: 16px 20px;
          cursor: pointer; display: flex; align-items: flex-start; gap: 0;
          transition: border-color 0.25s, background 0.25s;
        }
        .opt-card input { display: none; }
        .opt-card span {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45);
          transition: color 0.25s; line-height: 1.4;
        }
        .opt-card strong { color: rgba(255,255,255,0.7); }
        .opt-card.selected { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }
        .opt-card.selected span { color: #fff; }
        .opt-card--full { grid-column: 1 / -1; }

        .step-nav { display: flex; align-items: center; gap: 28px; padding-top: 8px; }
        .nav-back {
          background: none; border: none; font-family: inherit; font-size: 12px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); cursor: pointer; transition: color 0.3s;
        }
        .nav-back:hover { color: #fff; }
        .nav-next {
          background: none; border: 1px solid rgba(255,255,255,0.2);
          padding: 14px 32px; font-family: inherit; font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 2px; color: #fff; cursor: pointer;
          display: flex; align-items: center; gap: 10px; transition: border-color 0.3s, background 0.3s;
        }
        .nav-next:hover { border-color: #fff; background: rgba(255,255,255,0.06); }
        .nav-submit {
          background: linear-gradient(90deg,#00b3e8,#00c25f);
          border: none; padding: 16px 40px; font-family: inherit; font-size: 12px;
          font-weight: 800; text-transform: uppercase; letter-spacing: 2px;
          color: #fff; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: opacity 0.3s;
        }
        .nav-submit:hover { opacity: 0.85; }
        .nav-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Calendar */
        .cal-wrap { user-select: none; }
        .cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .cal-month-label { font-size: 15px; font-weight: 800; color: #fff; text-transform: capitalize; }
        .cal-arrow {
          background: none; border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5); width: 36px; height: 36px;
          cursor: pointer; font-size: 16px; display: flex; align-items: center;
          justify-content: center; transition: border-color 0.2s, color 0.2s;
        }
        .cal-arrow:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
        .cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-bottom: 8px; }
        .cal-weekday {
          text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: rgba(255,255,255,0.25); padding: 6px 0;
        }
        .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
        .cal-day {
          aspect-ratio: 1; background: none; border: 1px solid transparent;
          color: rgba(255,255,255,0.6); font-family: inherit; font-size: 13px;
          font-weight: 600; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .cal-day:hover:not(.disabled):not(.empty) { border-color: rgba(255,255,255,0.3); color: #fff; }
        .cal-day.today { color: #00c25f; }
        .cal-day.selected { background: linear-gradient(135deg,#00b3e8,#00c25f); color: #fff; border-color: transparent; }
        .cal-day.disabled { color: rgba(255,255,255,0.12); cursor: not-allowed; }
        .cal-day.empty { cursor: default; }

        .time-section { margin-top: 32px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.07); }
        .time-section-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 16px;
        }
        .time-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .time-btn {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); font-family: inherit; font-size: 12px;
          font-weight: 700; padding: 12px 8px; cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s; text-align: center;
        }
        .time-btn:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
        .time-btn.selected { background: linear-gradient(135deg,#00b3e8,#00c25f); border-color: transparent; color: #fff; }

        .cal-selected-display { margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.4); min-height: 20px; }
        .cal-selected-display strong { color: #fff; }

        .form-legal { font-size: 11px; color: rgba(255,255,255,0.2); line-height: 1.7; margin-top: 24px; }

        .book-confirm { padding: 80px 0; text-align: center; }
        .confirm-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg,#00b3e8,#00c25f);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
        }
        .book-confirm h2 { font-size: 2.4rem; font-weight: 800; margin-bottom: 16px; color: #fff; }
        .book-confirm p { font-size: 16px; color: rgba(255,255,255,0.45); line-height: 1.8; max-width: 480px; margin: 0 auto 40px; }
        .confirm-back {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 2px; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.3s;
        }
        .confirm-back:hover { color: #fff; }

        @media (max-width: 991px) {
          .book-layout { grid-template-columns: 1fr; }
          .book-info { position: static; height: auto; padding: 100px 32px 48px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .book-form-panel { padding: 56px 32px 80px; }
          .book-header { padding: 24px 32px; }
        }
        @media (max-width: 600px) {
          .field-row { grid-template-columns: 1fr; }
          .opt-grid { grid-template-columns: 1fr; }
          .book-form-panel { padding: 48px 20px 60px; }
          .book-info { padding: 90px 20px 40px; }
          .book-header { padding: 20px; }
        }
      `}</style>

      {/* Header */}
      <header className="book-header">
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <svg
            style={{ height: 22, color: "#fff" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 521.55 115.12"
          >
            <defs>
              <linearGradient
                id="agendar-lg"
                x1="509.39"
                y1="91.65"
                x2="519.93"
                y2="78.66"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#00b3e8" />
                <stop offset="1" stopColor="#00c25f" />
              </linearGradient>
            </defs>
            <g>
              <rect
                fill="currentColor"
                x="324.73"
                y="14.95"
                width="12.79"
                height="12.78"
              />
              <rect
                fill="currentColor"
                x="324.73"
                y="40.56"
                width="12.79"
                height="50.41"
              />
              <rect
                fill="currentColor"
                x="218.23"
                y="40.56"
                width="12.79"
                height="50.41"
              />
              <rect
                fill="currentColor"
                x="218.23"
                y="14.95"
                width="12.79"
                height="12.78"
              />
              <path
                fill="currentColor"
                d="M43.07,92.54c-8.96,0-16.66-1.8-23.1-5.42-6.44-3.61-11.38-8.81-14.81-15.6-3.44-6.79-5.16-14.92-5.16-24.41s1.72-17.62,5.16-24.41c3.44-6.79,8.37-11.99,14.81-15.6,6.44-3.61,14.14-5.42,23.1-5.42,17.23,0,29.84,6.79,37.85,20.36l-11.88,5.87c-2.7-4.44-6.09-7.9-10.18-10.38-4.09-2.48-9.22-3.72-15.4-3.72s-11.49,1.33-15.92,3.98c-4.44,2.66-7.81,6.46-10.11,11.42-2.31,4.96-3.46,10.92-3.46,17.88,0,10.44,2.61,18.58,7.83,24.41,5.22,5.83,12.44,8.74,21.67,8.74,6.18,0,11.31-1.22,15.4-3.65,4.09-2.43,7.48-5.87,10.18-10.31l11.88,5.87c-8.01,13.57-20.62,20.36-37.85,20.36Z"
              />
              <path
                fill="currentColor"
                d="M126.73,90.97V3.26h33.41c14.18,0,25.14,3.81,32.89,11.42,7.74,7.62,11.62,18.43,11.62,32.43,0,9.4-1.74,17.36-5.22,23.88-3.48,6.53-8.55,11.49-15.21,14.88-6.66,3.39-14.68,5.09-24.08,5.09h-33.41ZM140.3,79.22h19.06c6.7,0,12.4-1.26,17.1-3.79,4.7-2.52,8.27-6.18,10.7-10.96,2.44-4.78,3.65-10.57,3.65-17.36,0-10.18-2.72-18.08-8.16-23.69-5.44-5.61-13.2-8.42-23.3-8.42h-19.06v64.21Z"
              />
              <path
                fill="currentColor"
                d="M275.78,89.4c-9.31,0-16.58-2.76-21.8-8.29-5.22-5.52-7.83-13.16-7.83-22.91,0-6.53,1.17-12.12,3.52-16.77,2.35-4.65,5.74-8.24,10.18-10.77,4.44-2.52,9.74-3.78,15.92-3.78,10.79,0,18.53,4.61,23.23,13.83l-3.91,6c-4.26-6-9.88-9.01-16.84-9.01-4,0-7.42.81-10.25,2.41-2.83,1.61-4.98,3.96-6.46,7.05-1.48,3.09-2.22,6.77-2.22,11.03,0,6.35,1.67,11.33,5.02,14.94,3.35,3.61,7.98,5.42,13.9,5.42,3.48,0,6.61-.76,9.4-2.28,2.78-1.52,5.26-3.76,7.44-6.72l3.91,6.13c-2.35,4.53-5.46,7.94-9.33,10.25-3.87,2.31-8.51,3.46-13.9,3.46ZM276.04,115.12c-5.22,0-10.09-.72-14.62-2.15-4.53-1.44-8.57-3.59-12.14-6.46l6.13-8.48c2.87,2,5.92,3.63,9.14,4.89,3.22,1.26,6.83,1.89,10.83,1.89,6.27,0,11.05-1.52,14.36-4.57,3.31-3.05,4.96-7.4,4.96-13.05v-46.2l2.74-12.53h10.05v55.86c0,9.83-2.74,17.42-8.22,22.78-5.48,5.35-13.23,8.03-23.23,8.03Z"
              />
              <path
                fill="currentColor"
                d="M350.56,39.68v-11.22h44.9v11.22h-44.9ZM383.97,92.54c-6.79,0-12.05-1.87-15.79-5.61-3.74-3.74-5.61-9.01-5.61-15.79V14.49l12.79-6.4v62.39c0,3.39.91,6,2.74,7.83s4.48,2.74,7.96,2.74c1.57,0,3.11-.2,4.63-.59,1.52-.39,3.02-.89,4.5-1.5l3.39,10.44c-4.35,2.09-9.22,3.13-14.62,3.13Z"
              />
              <path
                fill="currentColor"
                d="M429.52,92.54c-6.96,0-12.53-1.78-16.71-5.35-4.18-3.57-6.26-8.4-6.26-14.49s2.3-11.24,6.92-14.68c4.61-3.44,11.01-5.16,19.19-5.16,7.05,0,13.27,1.57,18.66,4.7l-2.61,7.7c-4.18-2.52-8.83-3.79-13.97-3.79-4.79,0-8.55.96-11.29,2.87-2.74,1.91-4.11,4.57-4.11,7.96s1.22,6.05,3.65,7.96c2.43,1.92,5.65,2.87,9.66,2.87,3.31,0,6.31-.74,9.01-2.22,2.7-1.48,5.05-3.65,7.05-6.53l3.26,5.74c-2.35,4.18-5.42,7.29-9.2,9.33-3.79,2.04-8.2,3.07-13.25,3.07ZM450.66,90.97l-2.35-11.88v-27.41c0-4.52-1.26-7.98-3.79-10.38-2.52-2.39-6.18-3.59-10.96-3.59-3.31,0-6.37.48-9.2,1.44-2.83.96-5.55,2.22-8.16,3.79l-6.53-9.01c7.13-4.7,15.36-7.05,24.67-7.05,8.61,0,15.16,2.15,19.64,6.46,4.48,4.31,6.72,10.64,6.72,18.99v38.63h-10.05Z"
              />
              <path
                fill="currentColor"
                d="M477.94,90.97V6.4l12.79-6.4v90.97h-12.79Z"
              />
            </g>
            <rect
              fill="url(#agendar-lg)"
              x="508.72"
              y="78.15"
              width="12.84"
              height="12.84"
            />
          </svg>
        </Link>
        <Link href="/contacto" className="book-back">
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>
      </header>

      <div
        className="book-layout"
        style={{ background: "#0d0d0d", color: "#fff" }}
      >
        {/* Panel izquierdo */}
        <aside className="book-info">
          <span className="book-tag">Consultoría Gratuita</span>
          <h1 className="book-title">
            Agendar
            <br />
            <span style={{ fontStyle: "italic" }}>consulta.</span>
          </h1>
          <p className="book-desc">
            Esta sesión de 30 minutos está diseñada para evaluar tu negocio y
            diseñar un plan personalizado de digitalización que genere
            resultados reales.
          </p>

          <p className="book-discover-label">
            Durante la consultoría descubriremos:
          </p>
          <ul className="book-perks">
            <li>El estado actual de tu presencia digital</li>
            <li>Oportunidades específicas para tu negocio</li>
            <li>Estrategia recomendada (marca, web, marketing)</li>
            <li>Inversión estimada y tiempos de implementación</li>
          </ul>

          <div className="book-duration">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.4 }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            30 minutos · Sin costo · Sin compromiso
          </div>

          <p className="book-note">
            El brief toma 3–5 minutos. Así llegamos preparados con ideas
            específicas para ti.
          </p>
        </aside>

        {/* Panel derecho */}
        <main className="book-form-panel">
          {/* Progress */}
          <div className="book-progress">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={
                  step > i || confirmed ? "done" : step === i ? "done" : ""
                }
              />
            ))}
          </div>

          {!confirmed ? (
            <form onSubmit={handleSubmit}>
              {/* Paso 1: Contacto */}
              {step === 1 && (
                <div>
                  <p className="step-tag">
                    Paso 1 de 5 — Información de Contacto
                  </p>
                  <h2 className="step-heading">
                    ¿Con quién
                    <br />
                    tenemos el gusto?
                  </h2>
                  <div className="field-block">
                    <div className="field-row">
                      <div className="field-group">
                        <input
                          className="field-input"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <input
                          className="field-input"
                          type="text"
                          placeholder="Dueño, Gerente, Marketing..."
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <input
                        className="field-input"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <div className="phone-row">
                        <span className="phone-prefix">🇩🇴 +1</span>
                        <input
                          className="field-input"
                          type="tel"
                          placeholder="(809) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button
                      type="button"
                      className="nav-next"
                      onClick={() => goNext(1)}
                    >
                      Continuar <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 2: Negocio */}
              {step === 2 && (
                <div>
                  <p className="step-tag">Paso 2 de 5 — Sobre tu Negocio</p>
                  <h2 className="step-heading">
                    Cuéntanos sobre
                    <br />
                    tu negocio
                  </h2>
                  <div className="field-block">
                    <div className="field-group">
                      <input
                        className="field-input"
                        type="text"
                        placeholder="Nombre de tu empresa o proyecto"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <span className="field-label-top">
                        ¿A qué sector pertenece?*
                      </span>
                      <div className="opt-grid">
                        {[
                          "Restaurante / Gastronomía",
                          "Retail / Comercio",
                          "Servicios Profesionales",
                          "Salud / Wellness",
                          "Tecnología / Software",
                          "Construcción / Inmobiliaria",
                        ].map((s) => (
                          <label
                            key={s}
                            className={`opt-card${sector === s ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="sector"
                              value={s}
                              checked={sector === s}
                              onChange={() => setSector(s)}
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                        <label
                          className={`opt-card opt-card--full${sector === "Otro" ? " selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="sector"
                            value="Otro"
                            checked={sector === "Otro"}
                            onChange={() => setSector("Otro")}
                          />
                          <span>Otro</span>
                        </label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="field-label-top">
                        ¿En qué etapa está tu negocio?*
                      </span>
                      <div className="opt-grid">
                        {[
                          ["Idea / Emprendimiento", "Idea / Emprendimiento"],
                          [
                            "Inicio (menos de 1 año)",
                            "Inicio — menos de 1 año",
                          ],
                          [
                            "En crecimiento (1–3 años)",
                            "En crecimiento — 1 a 3 años",
                          ],
                          [
                            "Establecido (más de 3 años)",
                            "Establecido — más de 3 años",
                          ],
                        ].map(([val, label]) => (
                          <label
                            key={val}
                            className={`opt-card${stage === val ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="stage"
                              value={val}
                              checked={stage === val}
                              onChange={() => setStage(val)}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="field-label-top">
                        ¿Qué tienes actualmente en digital?{" "}
                        <span
                          style={{
                            opacity: 0.5,
                            fontWeight: 500,
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (Puedes marcar varios)
                        </span>
                      </span>
                      <div className="opt-grid">
                        {[
                          "Logo / marca diseñada",
                          "Página web",
                          "Redes sociales activas",
                          "Publicidad digital",
                          "Tienda online",
                        ].map((d) => (
                          <label
                            key={d}
                            className={`opt-card${digital.includes(d) ? " selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={digital.includes(d)}
                              onChange={() =>
                                setDigital((prev) => toggleArray(prev, d))
                              }
                            />
                            <span>{d}</span>
                          </label>
                        ))}
                        <label
                          className={`opt-card opt-card--full${digital.includes("Nada aún — Empiezo desde cero") ? " selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={digital.includes(
                              "Nada aún — Empiezo desde cero",
                            )}
                            onChange={() =>
                              setDigital((prev) =>
                                toggleArray(
                                  prev,
                                  "Nada aún — Empiezo desde cero",
                                ),
                              )
                            }
                          />
                          <span>Nada aún — Empiezo desde cero</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button
                      type="button"
                      className="nav-back"
                      onClick={() => goPrev(2)}
                    >
                      ← Atrás
                    </button>
                    <button
                      type="button"
                      className="nav-next"
                      onClick={() => goNext(2)}
                    >
                      Continuar <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Desafíos */}
              {step === 3 && (
                <div>
                  <p className="step-tag">Paso 3 de 5 — Desafíos y Objetivos</p>
                  <h2 className="step-heading">
                    ¿Qué quieres
                    <br />
                    resolver?
                  </h2>
                  <div className="field-block">
                    <div className="field-group">
                      <span className="field-label-top">
                        ¿Cuál es tu principal desafío digital?*
                      </span>
                      <div className="opt-grid">
                        {[
                          "No tengo presencia digital y no sé por dónde empezar",
                          "Tengo web/redes pero no generan ventas",
                          "No tengo tiempo para gestionar marketing",
                          "Mi marca no se ve profesional",
                          "No aparezco en Google cuando me buscan",
                          "Necesito más clientes / ventas",
                          "Necesito renovar completamente mi imagen",
                        ].map((c) => (
                          <label
                            key={c}
                            className={`opt-card opt-card--full${challenge === c ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="challenge"
                              value={c}
                              checked={challenge === c}
                              onChange={() => setChallenge(c)}
                            />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="field-label-top">
                        ¿Qué servicios te interesan?{" "}
                        <span
                          style={{
                            opacity: 0.5,
                            fontWeight: 500,
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (Puedes marcar varios)
                        </span>
                      </span>
                      <div className="opt-grid">
                        {[
                          "Diseño de Marca",
                          "Desarrollo Web",
                          "Tienda Online",
                          "Marketing Digital",
                          "Posicionamiento SEO",
                          "Community Manager",
                          "Sistema Empresarial",
                        ].map((s) => (
                          <label
                            key={s}
                            className={`opt-card${services.includes(s) ? " selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={services.includes(s)}
                              onChange={() =>
                                setServices((prev) => toggleArray(prev, s))
                              }
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                        <label
                          className={`opt-card opt-card--full${services.includes("No estoy seguro — Necesito asesoría") ? " selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={services.includes(
                              "No estoy seguro — Necesito asesoría",
                            )}
                            onChange={() =>
                              setServices((prev) =>
                                toggleArray(
                                  prev,
                                  "No estoy seguro — Necesito asesoría",
                                ),
                              )
                            }
                          />
                          <span>No estoy seguro — Necesito asesoría</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button
                      type="button"
                      className="nav-back"
                      onClick={() => goPrev(3)}
                    >
                      ← Atrás
                    </button>
                    <button
                      type="button"
                      className="nav-next"
                      onClick={() => goNext(3)}
                    >
                      Continuar <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 4: Fecha y Hora */}
              {step === 4 && (
                <div>
                  <p className="step-tag">Paso 4 de 5 — Fecha y Hora</p>
                  <h2 className="step-heading">
                    ¿Cuándo
                    <br />
                    nos reunimos?
                  </h2>
                  <div className="field-block">
                    <div className="field-group">
                      <div className="cal-wrap">
                        <div className="cal-nav">
                          <button
                            type="button"
                            className="cal-arrow"
                            onClick={calPrev}
                          >
                            ‹
                          </button>
                          <span className="cal-month-label">
                            {MONTHS_ES[calMonth]} {calYear}
                          </span>
                          <button
                            type="button"
                            className="cal-arrow"
                            onClick={calNext}
                          >
                            ›
                          </button>
                        </div>
                        <div className="cal-weekdays">
                          {[
                            "Dom",
                            "Lun",
                            "Mar",
                            "Mié",
                            "Jue",
                            "Vie",
                            "Sáb",
                          ].map((d) => (
                            <div key={d} className="cal-weekday">
                              {d}
                            </div>
                          ))}
                        </div>
                        <div className="cal-grid">
                          {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="cal-day empty" />
                          ))}
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const d = i + 1;
                            const thisDay = new Date(calYear, calMonth, d);
                            const dow = thisDay.getDay();
                            const isPast = thisDay < today;
                            const isWeekend = dow === 0 || dow === 6;
                            const isToday =
                              thisDay.toDateString() === today.toDateString();
                            const isSelected =
                              selectedDate?.toDateString() ===
                              thisDay.toDateString();
                            const disabled = isPast || isWeekend;
                            let cls = "cal-day";
                            if (disabled) cls += " disabled";
                            else {
                              if (isToday) cls += " today";
                              if (isSelected) cls += " selected";
                            }
                            return (
                              <button
                                key={d}
                                type="button"
                                className={cls}
                                disabled={disabled}
                                onClick={() => {
                                  if (!disabled) {
                                    setSelectedDate(thisDay);
                                    setSelectedTime(null);
                                  }
                                }}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="time-section">
                        <p className="time-section-label">Horario disponible</p>
                        <div className="time-grid">
                          {TIME_SLOTS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              className={`time-btn${selectedTime === t ? " selected" : ""}`}
                              onClick={() => setSelectedTime(t)}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="cal-selected-display">
                          {getCalSelectedDisplay()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button
                      type="button"
                      className="nav-back"
                      onClick={() => goPrev(4)}
                    >
                      ← Atrás
                    </button>
                    <button
                      type="button"
                      className="nav-next"
                      onClick={() => goNext(4)}
                    >
                      Continuar <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 5: Inversión */}
              {step === 5 && (
                <div>
                  <p className="step-tag">Paso 5 de 5 — Inversión</p>
                  <h2 className="step-heading">
                    ¿Cuál es tu
                    <br />
                    presupuesto aproximado?
                  </h2>
                  <div className="field-block">
                    <div className="field-group">
                      <div className="opt-grid">
                        {[
                          [
                            "Menos de $1,000 USD",
                            "Presupuesto ajustado",
                            "Menos de $1,000 USD",
                          ],
                          [
                            "$1,000 - $2,000 USD",
                            "Presupuesto moderado",
                            "$1,000 – $2,000 USD",
                          ],
                          [
                            "$2,000 - $4,000 USD",
                            "Presupuesto flexible",
                            "$2,000 – $4,000 USD",
                          ],
                          [
                            "Más de $4,000 USD",
                            "Presupuesto amplio",
                            "Más de $4,000 USD",
                          ],
                        ].map(([val, label, range]) => (
                          <label
                            key={val}
                            className={`opt-card opt-card--full${budget === val ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="budget"
                              value={val}
                              checked={budget === val}
                              onChange={() => setBudget(val)}
                            />
                            <span>
                              <strong>{label}</strong> &nbsp;—&nbsp; {range}
                            </span>
                          </label>
                        ))}
                        <label
                          className={`opt-card opt-card--full${budget === "Aún explorando opciones" ? " selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="budget"
                            value="Aún explorando opciones"
                            checked={budget === "Aún explorando opciones"}
                            onChange={() =>
                              setBudget("Aún explorando opciones")
                            }
                          />
                          <span>Aún explorando opciones</span>
                        </label>
                      </div>
                    </div>
                    <div className="field-group">
                      <textarea
                        className="field-input"
                        rows={4}
                        placeholder="¿Hay algo más que debamos saber sobre tu proyecto antes de la consultoría?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                    <p className="form-legal">
                      Al enviar este formulario, aceptas que C Digital utilice
                      tu información para contactarte. Tus datos están seguros y
                      nunca serán compartidos con terceros.
                    </p>
                  </div>
                  <div className="step-nav">
                    <button
                      type="button"
                      className="nav-back"
                      onClick={() => goPrev(5)}
                    >
                      ← Atrás
                    </button>
                    <button
                      type="submit"
                      className="nav-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Programar consultoría"}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="book-confirm">
              <div className="confirm-icon">
                <CheckIcon />
              </div>
              <h2>¡Consulta agendada!</h2>
              <p>
                Recibimos tu brief. Nos ponemos en contacto en menos de 24 horas
                para confirmar la sesión y llegar preparados con ideas
                específicas para ti.
              </p>
              <Link href="/" className="confirm-back">
                ← Volver al inicio
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
