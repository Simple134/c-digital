"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormData {
  nombre: string;
  email: string;
  whatsapp: string;
  negocio: string;
  posicion: string;
  sector: string;
  etapa: string;
  digital: string[];
  desafios: string[];
  servicios: string[];
  presupuesto: string;
  adicional: string;
}

const AuditoriaForm = () => {
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(
    "America/Santo_Domingo",
  );
  const [showDateTimeError, setShowDateTimeError] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nombre: "",
      email: "",
      whatsapp: "",
      negocio: "",
      posicion: "",
      sector: "",
      etapa: "",
      digital: [],
      desafios: [],
      servicios: [],
      presupuesto: "",
      adicional: "",
    },
  });

  const formData = watch(); // Watch all fields for conditional logic if needed, or simply to track state for debugging/display

  // Available slots (simulated - replace with API call)
  const availableSlots: Record<string, string[]> = {
    "2026-01-13": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-14": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-15": ["19:00", "20:00"],
    "2026-01-16": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-17": ["19:00", "20:00", "20:30"],
    "2026-01-20": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-21": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-22": ["19:00", "19:30", "20:00"],
    "2026-01-23": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-27": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-28": ["19:00", "19:30", "20:00", "20:30"],
    "2026-01-29": ["19:00", "20:00", "20:30"],
    "2026-01-30": ["19:00", "19:30", "20:00", "20:30"],
  };

  const monthNames = [
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
  const dayNames = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  // Calendar generation
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, key: `empty-${i}` });
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const currentDateObj = new Date(year, month, day);
      const isPast =
        currentDateObj <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const hasSlots = availableSlots[dateStr];
      const isToday = currentDateObj.toDateString() === today.toDateString();
      const isSelected = selectedDate === dateStr;

      days.push({
        day,
        dateStr,
        isPast,
        hasSlots,
        isToday,
        isSelected,
        key: dateStr,
      });
    }

    return days;
  };

  // Handlers
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setShowDateTimeError(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowDateTimeError(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      setShowDateTimeError(true);
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckboxChange = (
    name: "digital" | "desafios" | "servicios",
    value: string,
  ) => {
    const currentValues = formData[name];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item: string) => item !== value)
      : [...currentValues, value];
    setValue(name, newValues);
  };

  const formatWhatsApp = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";

    if (cleaned.length > 0) {
      if (cleaned.length <= 3) formatted = "+1 (" + cleaned;
      else if (cleaned.length <= 6)
        formatted = "+1 (" + cleaned.slice(0, 3) + ") " + cleaned.slice(3);
      else if (cleaned.length <= 10)
        formatted =
          "+1 (" +
          cleaned.slice(0, 3) +
          ") " +
          cleaned.slice(3, 6) +
          "-" +
          cleaned.slice(6);
      else
        formatted =
          "+1 (" +
          cleaned.slice(0, 3) +
          ") " +
          cleaned.slice(3, 6) +
          "-" +
          cleaned.slice(6, 10);
    }

    return formatted;
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":");
    const endMinutes = parseInt(minutes) + 30;
    return endMinutes >= 60
      ? `${parseInt(hours) + 1}:${String(endMinutes - 60).padStart(2, "0")}`
      : `${hours}:${endMinutes}`;
  };

  const getFormattedDate = () => {
    if (!selectedDate) return null;
    const [year, month, day] = selectedDate.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[parseInt(month) - 1];
    return { dayName, day: parseInt(day), monthName, year };
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    const submitData = {
      "Nombre": data.nombre,
      "Correo": data.email,
      "Negocio": data.negocio,
      "Posicion": data.posicion,
      "Whatsapp": data.whatsapp,
      "Sector": data.sector,
      "Etapa del negocio": data.etapa,
      "Que tienes actualmente": data.digital.join(", "),
      "Desafio actual": data.desafios.join(", "),
      "Servicios": data.servicios.join(", "),
      "Presupuesto": data.presupuesto,
      "Informacion extra": data.adicional,
      "Dia de reunion": `${selectedDate} ${selectedTime} (${selectedTimezone})`
    };

    console.log("Form Data:", submitData);

    try {
      const formId = 51
      const response = await fetch(`/api/contact-gestiono/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: submitData }),
      });

      if (response.ok) {
        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.error("Error submitting form");
        alert(
          "Hubo un error al enviar el formulario. Por favor intenta de nuevo.",
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Hubo un error al enviar el formulario. Por favor intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendar = generateCalendar();
  const timeSlots = selectedDate ? availableSlots[selectedDate] || [] : [];
  const formattedDate = getFormattedDate();

  return (
    <div className=" text-white min-h-screen font-sans relative">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 py-10 lg:py-16 z-10">
        {/* Header */}
        <header className="text-center mb-12 animate-fadeInDown">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
            Auditoría - Fase 1
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Consultoría Digital Gratuita para PYMES
          </p>
        </header>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          <div
            className={`w-10 h-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-[#00d9ff]" : "bg-[#1a1a1a]"}`}
          />
          <div
            className={`w-10 h-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-[#00d9ff]" : "bg-[#1a1a1a]"}`}
          />
        </div>

        {/* Step 1: Date & Time Selection */}
        {currentStep === 1 && !showSuccess && (
          <div className="animate-fadeIn">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-center mb-8">
                Selecciona una fecha y hora
              </h2>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Calendar */}
                <div className="bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-9 h-9 border border-[#1a1a1a] rounded-lg hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 flex items-center justify-center text-xl transition-all"
                    >
                      ‹
                    </button>
                    <div className="text-base font-semibold capitalize">
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear()}
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-9 h-9 border border-[#1a1a1a] rounded-lg hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 flex items-center justify-center text-xl transition-all"
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-400 py-2"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendar.map((dayData) => {
                      if (dayData.isEmpty) {
                        return (
                          <div key={dayData.key} className="aspect-square" />
                        );
                      }

                      let classes =
                        "aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all border ";

                      if (dayData.isPast || !dayData.hasSlots) {
                        classes +=
                          "text-gray-400 opacity-30 cursor-not-allowed border-transparent";
                      } else {
                        classes +=
                          "border-transparent hover:bg-[#00d9ff]/5 hover:border-[#00d9ff]";
                        if (dayData.isToday) classes += " border-[#00d9ff]";
                        if (dayData.isSelected)
                          classes += " bg-[#00d9ff] text-black font-bold";
                      }

                      return (
                        <div
                          key={dayData.key}
                          className={classes}
                          onClick={() =>
                            dayData.hasSlots && !dayData.isPast
                              ? handleDateSelect(dayData.dateStr)
                              : null
                          }
                        >
                          {dayData.day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl p-5 flex flex-col">
                  <div className="text-base font-semibold mb-4 pb-4 border-b border-[#1a1a1a]">
                    {selectedDate
                      ? (() => {
                        const [year, month, day] = selectedDate.split("-");
                        const date = new Date(
                          parseInt(year),
                          parseInt(month) - 1,
                          parseInt(day),
                        );
                        const dayName = dayNames[date.getDay()];
                        const monthName = monthNames[parseInt(month) - 1];
                        return `${dayName}, ${parseInt(day)} de ${monthName}`;
                      })()
                      : "Selecciona una fecha"}
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {!selectedDate ? (
                      <div className="text-center text-gray-400 py-16 text-sm">
                        👈 Selecciona una fecha del calendario
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center text-gray-400 py-16 text-sm">
                        No hay horarios disponibles
                      </div>
                    ) : (
                      timeSlots.map((time) => (
                        <div
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-4 py-3.5 border rounded-lg text-center text-sm font-medium cursor-pointer transition-all ${selectedTime === time
                              ? "bg-[#00d9ff] text-black border-[#00d9ff]"
                              : "border-[#1a1a1a] hover:border-[#00d9ff] hover:bg-[#00d9ff]/5"
                            }`}
                        >
                          {time}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl p-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium mb-2.5">
                  <span className="text-lg">🌎</span>
                  Zona horaria
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-[#1a1a1a] rounded-lg text-white cursor-pointer focus:outline-none focus:border-[#00d9ff]"
                >
                  <option value="America/Santo_Domingo">
                    Hora del Atlántico (16:15)
                  </option>
                  <option value="America/New_York">Hora del Este (EST)</option>
                  <option value="America/Chicago">Hora Central (CST)</option>
                  <option value="America/Los_Angeles">
                    Hora del Pacífico (PST)
                  </option>
                  <option value="Europe/Madrid">Hora de Madrid (CET)</option>
                </select>
              </div>

              {showDateTimeError && (
                <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400 rounded-lg p-3 mb-6">
                  ⚠️ Por favor selecciona una fecha y hora antes de continuar
                </div>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Brief Form */}
        {currentStep === 2 && !showSuccess && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <button
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-2 text-[#00d9ff] text-sm font-medium hover:gap-3 transition-all cursor-pointer mb-5"
              >
                <span>←</span>
                <span>Cambiar fecha/hora</span>
              </button>

              {/* Session Info */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="flex items-center gap-2.5 px-4 py-3 bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl text-xs">
                  <span className="text-lg">⏱️</span>
                  <span>30 min</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl text-xs sm:col-span-2">
                  <span className="text-lg">💻</span>
                  <span>
                    Los detalles de la conferencia web se proporcionan en la
                    confirmación.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl text-xs lg:col-span-3">
                  <span className="text-lg">📅</span>
                  <span>
                    {formattedDate &&
                      `${selectedTime} - ${getEndTime(selectedTime!)}, ${formattedDate.dayName}, ${formattedDate.day} de ${formattedDate.monthName} de ${formattedDate.year}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-[#00d9ff]/5 border border-[#1a1a1a] rounded-xl text-xs">
                  <span className="text-lg">🌎</span>
                  <span>Hora del Atlántico</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden mb-8">
                <h3
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center gap-3 px-6 py-4 text-base font-semibold cursor-pointer hover:bg-[#00d9ff]/5 transition-all select-none"
                >
                  <span
                    className={`text-[#00d9ff] text-sm transition-transform ${showDescription ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                  <span>Descripción</span>
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-400 ${showDescription ? "max-h-[600px]" : "max-h-0"}`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-base font-semibold mb-3">
                      Consultoría Digital Gratuita para PYMES
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      ¡Gracias por tu interés en C Digital! Esta consultoría de
                      30 minutos está diseñada para evaluar tu negocio y diseñar
                      un plan personalizado de digitalización que genere
                      resultados reales.
                    </p>
                    <p className="text-sm font-semibold mb-2">
                      Durante la consultoría descubriremos:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="text-sm text-gray-400 leading-relaxed">
                        ✓ El estado actual de tu presencia digital
                      </li>
                      <li className="text-sm text-gray-400 leading-relaxed">
                        ✓ Oportunidades específicas para tu negocio
                      </li>
                      <li className="text-sm text-gray-400 leading-relaxed">
                        ✓ Estrategia recomendada (marca, web, marketing)
                      </li>
                      <li className="text-sm text-gray-400 leading-relaxed">
                        ✓ Inversión estimada y tiempos de implementación
                      </li>
                    </ul>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      <strong>
                        Para aprovechar al máximo nuestra reunión, completa este
                        brief rápido (toma 3-5 minutos). Así llegamos preparados
                        con ideas específicas para ti.
                      </strong>
                    </p>
                    <p className="text-sm text-gray-400 mt-3">¡Comencemos!</p>
                  </div>
                </div>
              </div>

              <p className="text-xl font-semibold text-center mb-8">
                Introduce los detalles
              </p>
            </div>

            {/* Brief Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10"
            >
              {/* Información Personal */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Información de Contacto
                </h2>

                <div className="space-y-7">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium mb-2.5"
                    >
                      Nombre <span className="text-[#00d9ff]">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      placeholder="Tu nombre completo"
                      {...register("nombre", { required: true })}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                    />
                    {errors.nombre && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="posicion"
                      className="block text-sm font-medium mb-2.5"
                    >
                      Posición / Cargo <span className="text-[#00d9ff]">*</span>
                    </label>
                    <input
                      type="text"
                      id="posicion"
                      placeholder="Ej: Dueño, Gerente, Marketing..."
                      {...register("posicion", { required: true })}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                    />
                    {errors.posicion && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2.5"
                    >
                      Correo electrónico{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="tu@email.com"
                      {...register("email", { required: true })}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-sm font-medium mb-2.5"
                    >
                      ¿Cuál es tu mejor WhatsApp para contactarte?{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                        🇩🇴
                      </span>
                      <input
                        type="tel"
                        id="whatsapp"
                        placeholder="+1 (809) 000-0000"
                        {...register("whatsapp", { required: true })}
                        onChange={(e) => {
                          const formatted = formatWhatsApp(e.target.value);
                          setValue("whatsapp", formatted);
                        }}
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      />
                    </div>
                    {errors.whatsapp && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del Negocio */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Sobre tu Negocio
                </h2>

                <div className="space-y-7">
                  <div>
                    <label
                      htmlFor="negocio"
                      className="block text-sm font-medium mb-2.5"
                    >
                      ¿Cómo se llama tu negocio o proyecto?{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <input
                      type="text"
                      id="negocio"
                      placeholder="Nombre de tu empresa"
                      {...register("negocio", { required: true })}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                    />
                    {errors.negocio && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2.5">
                      ¿A qué sector pertenece tu negocio?{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "restaurante",
                          label: "Restaurante / Gastronomía",
                        },
                        { value: "retail", label: "Retail / Comercio" },
                        {
                          value: "servicios",
                          label:
                            "Servicios Profesionales (abogados, contadores, etc.)",
                        },
                        { value: "salud", label: "Salud / Wellness" },
                        { value: "tecnologia", label: "Tecnología / Software" },
                        {
                          value: "construccion",
                          label: "Construcción / Inmobiliaria",
                        },
                        { value: "otro", label: "Otro" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            {...register("sector", { required: true })}
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-2.5 after:h-2.5 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.sector && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Estado Actual */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Estado Actual
                </h2>

                <div className="space-y-7">
                  <div>
                    <label
                      htmlFor="etapa"
                      className="block text-sm font-medium mb-2.5"
                    >
                      ¿En qué etapa está tu negocio actualmente?{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <select
                      id="etapa"
                      {...register("etapa", { required: true })}
                      className="w-full px-4 py-3.5 pr-12 bg-transparent border border-[#1a1a1a] rounded-xl text-white cursor-pointer focus:outline-none focus:border-[#00d9ff] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width=%2712%27%20height=%278%27%20viewBox=%270%200%2012%208%27%20fill=%27none%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M1%201L6%206L11%201%27%20stroke=%27%23ffffff%27%20stroke-width=%272%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1.125rem_center] bg-no-repeat"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="idea">Es solo una idea</option>
                      <option value="nuevo">
                        Recién empezando (menos de 6 meses)
                      </option>
                      <option value="crecimiento">
                        En crecimiento (6 meses - 2 años)
                      </option>
                      <option value="establecido">
                        Establecido (más de 2 años)
                      </option>
                      <option value="expansion">En expansión</option>
                    </select>
                    {errors.etapa && (
                      <span className="text-red-500 text-xs">
                        Este campo es obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2.5">
                      ¿Qué tienes actualmente en digital?{" "}
                      <span className="text-[#00d9ff]">*</span>
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: "logo", label: "Tengo logo/marca diseñada" },
                        { value: "web", label: "Tengo página web" },
                        {
                          value: "redes",
                          label: "Tengo redes sociales activas",
                        },
                        {
                          value: "publicidad",
                          label: "Hago publicidad digital",
                        },
                        { value: "tienda", label: "Tengo tienda online" },
                        {
                          value: "nada",
                          label: "Nada aún - Empiezo desde cero",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={formData.digital?.includes(option.value)}
                            onChange={() =>
                              handleCheckboxChange("digital", option.value)
                            }
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desafíos */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Desafíos y Objetivos
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2.5">
                    ¿Cuál es el principal desafío digital que enfrentas
                    actualmente? <span className="text-[#00d9ff]">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: "no-presencia",
                        label:
                          "No tengo presencia digital y no sé por dónde empezar",
                      },
                      {
                        value: "no-ventas",
                        label: "Tengo web/redes pero no generan ventas",
                      },
                      {
                        value: "no-tiempo",
                        label: "No tengo tiempo para gestionar marketing",
                      },
                      {
                        value: "marca-no-profesional",
                        label: "Mi marca no se ve profesional",
                      },
                      {
                        value: "no-google",
                        label: "No aparezco en Google cuando me buscan",
                      },
                      {
                        value: "mas-clientes",
                        label: "Necesito más clientes/ventas",
                      },
                      {
                        value: "renovar",
                        label: "Necesito renovar completamente mi imagen",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.desafios?.includes(option.value)}
                          onChange={() =>
                            handleCheckboxChange("desafios", option.value)
                          }
                          className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Servicios de Interés
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2.5">
                    ¿Qué servicios te interesan para tu negocio?{" "}
                    <span className="text-[#00d9ff]">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: "branding",
                        label: "Diseño de Marca (Logo, identidad visual)",
                      },
                      {
                        value: "web",
                        label: "Desarrollo Web (Página corporativa)",
                      },
                      {
                        value: "ecommerce",
                        label: "Tienda Online (E-commerce)",
                      },
                      {
                        value: "marketing",
                        label: "Marketing Digital (Redes sociales, publicidad)",
                      },
                      {
                        value: "seo",
                        label: "Posicionamiento SEO (Aparecer en Google)",
                      },
                      {
                        value: "community",
                        label: "Community Manager (Gestión de redes)",
                      },
                      {
                        value: "sistema",
                        label: "Sistema Empresarial a medida",
                      },
                      {
                        value: "asesoria",
                        label: "No estoy seguro - Necesito asesoría",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.servicios?.includes(option.value)}
                          onChange={() =>
                            handleCheckboxChange("servicios", option.value)
                          }
                          className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Presupuesto */}
              <div className="mb-12">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Inversión
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2.5">
                    Para recomendarte la mejor solución digital para tu PYME,
                    ¿cuál es tu presupuesto aproximado para este proyecto?
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: "menos-1000",
                        label: "Presupuesto ajustado: Menos de $1,000 USD",
                      },
                      {
                        value: "1000-2000",
                        label: "Presupuesto moderado: $1,000 - $2,000 USD",
                      },
                      {
                        value: "2000-4000",
                        label: "Presupuesto flexible: $2,000 - $4,000 USD",
                      },
                      {
                        value: "mas-4000",
                        label: "Presupuesto amplio: Más de $4,000 USD",
                      },
                      { value: "explorando", label: "Aún explorando opciones" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          {...register("presupuesto")}
                          className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-2.5 after:h-2.5 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-[#00d9ff] uppercase tracking-widest mb-6 pb-3 border-b border-[#1a1a1a]">
                  Información Adicional
                </h2>
                <div>
                  <label
                    htmlFor="adicional"
                    className="block text-sm font-medium mb-2.5"
                  >
                    ¿Hay algo más que debamos saber sobre tu proyecto antes de
                    la consultoría?
                  </label>
                  <textarea
                    id="adicional"
                    placeholder="Cuéntanos cualquier detalle adicional..."
                    {...register("adicional")}
                    rows={4}
                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[120px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Programar Consultoría"}
              </button>

              <div className="text-center text-gray-400 text-xs leading-relaxed mt-8">
                Al enviar este formulario, aceptas que C Digital utilice tu
                información para contactarte.
                <br />
                Tus datos están seguros y nunca serán compartidos con terceros.
              </div>
            </form>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-16 animate-fadeIn">
            <div className="text-6xl mb-5">✓</div>
            <h2 className="text-3xl font-bold mb-3">¡Consultoría Agendada!</h2>
            <p className="text-gray-400 mb-8">
              Hemos recibido tu información. Te enviaremos los detalles de la
              conferencia web a tu correo electrónico.
            </p>
            {formattedDate && (
              <p className="text-sm text-gray-400">
                <strong>Fecha:</strong> {formattedDate.dayName},{" "}
                {formattedDate.day} de {formattedDate.monthName} de{" "}
                {formattedDate.year}
                <br />
                <strong>Hora:</strong> {selectedTime} -{" "}
                {getEndTime(selectedTime!)}
              </p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00d9ff;
        }
      `}</style>
    </div>
  );
};

export default AuditoriaForm;
