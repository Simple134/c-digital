"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";

interface BriefBrandFormData {
  // Información Personal y de Contacto
  nombreCompleto: string;
  whatsapp: string;
  email: string;
  pais: string;
  enSociedad: string;

  // Tipo de Proyecto
  tipoProyecto: string; // 'nuevo' | 'rebranding'

  // Redes actuales (array de strings)
  redes: string[];
  problemaActual: string;

  // Información Básica
  nombreMarca: string;
  personalidadMarca: string[];

  // Elementos de Marca
  tipoLogo: string;
  abiertoSugerencias: boolean;

  // Información Adicional
  presupuesto: string;
  adicional: string;
  servicios: string;
  diaReunion: string;
}

// Lista de países de América y Europa
const PAISES = [
  // América del Norte
  "Canadá",
  "Estados Unidos",
  "México",

  // América Central
  "Belice",
  "Costa Rica",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "Nicaragua",
  "Panamá",

  // Caribe
  "Antigua y Barbuda",
  "Bahamas",
  "Barbados",
  "Cuba",
  "Dominica",
  "Granada",
  "Haití",
  "Jamaica",
  "Puerto Rico",
  "República Dominicana",
  "San Cristóbal y Nieves",
  "Santa Lucía",
  "San Vicente y las Granadinas",
  "Trinidad y Tobago",

  // América del Sur
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Guyana",
  "Paraguay",
  "Perú",
  "Surinam",
  "Uruguay",
  "Venezuela",

  // Europa
  "Alemania",
  "Austria",
  "Bélgica",
  "España",
  "Francia",
  "Italia",
  "Países Bajos",
  "Portugal",
  "Reino Unido",
  "Suiza",
].sort();

export default function BriefBrandForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchPais, setSearchPais] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<BriefBrandFormData>({
    shouldUnregister: false, // Keep data even when fields are hidden
    defaultValues: {
      personalidadMarca: [],
      redes: [],
      tipoProyecto: "",
      abiertoSugerencias: false,
    },
  });

  const formData = watch(); // Watch all fields to update UI reactively

  // Helper to determine total steps based on project type
  const getMaxSteps = () => {
    if (formData.tipoProyecto === "nuevo") return 5;
    return 7;
  };

  const totalSteps = getMaxSteps();

  const handleCheckboxChange = (
    fieldName: keyof BriefBrandFormData,
    value: string,
  ) => {
    // We know these specific fields are arrays of strings based on our interface
    const currentArray = (getValues(fieldName) as string[]) || [];

    if (currentArray.includes(value)) {
      setValue(
        fieldName,
        currentArray.filter((item) => item !== value),
      );
    } else {
      setValue(fieldName, [...currentArray, value]);
      clearErrors(fieldName);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFieldsForStep = (step: number): (keyof BriefBrandFormData)[] => {
    const type = formData.tipoProyecto;

    if (step === 1) {
      return ["nombreCompleto", "whatsapp", "email", "pais", "enSociedad"];
    }

    if (step === 2) {
      return ["tipoProyecto"];
    }

    if (type === "rebranding") {
      if (step === 3) return []; // Redes actuales - opcional
      if (step === 4) return ["problemaActual"];
      if (step === 5) return ["nombreMarca", "personalidadMarca", "tipoLogo"];
      if (step === 6) return ["presupuesto", "diaReunion"];
      if (step === 7) return []; // adicional y servicios son opcionales
    } else {
      // Nuevo proyecto
      if (step === 3) return ["nombreMarca", "personalidadMarca", "tipoLogo"];
      if (step === 4) return ["presupuesto", "diaReunion"];
      if (step === 5) return []; // adicional y servicios son opcionales
    }

    return [];
  };

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fields);
    let isCustomValid = true;

    // Manual validation for checkbox groups
    if (
      (currentStep === 3 && formData.tipoProyecto === "nuevo") ||
      (currentStep === 5 && formData.tipoProyecto === "rebranding")
    ) {
      if (
        !formData.personalidadMarca ||
        formData.personalidadMarca.length === 0
      ) {
        setError("personalidadMarca", {
          type: "manual",
          message: "Debes seleccionar al menos una opción",
        });
        isCustomValid = false;
      }
    }

    if (!isStepValid || !isCustomValid) return;

    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmitForm = async () => {
    // Validar todos los campos antes de enviar
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit: SubmitHandler<BriefBrandFormData> = async (data) => {
    setIsSubmitting(true);

    const submitData = {
      Nombre: data.nombreCompleto || "nothing",
      "Correo Principal": data.email || "nothing",
      Pais: data.pais || "nothing",
      Sociedad: data.enSociedad || "nothing",
      "Tipo de Proyecto": data.tipoProyecto || "nothing",
      Whatsapp: data.whatsapp || "nothing",
      "Redes actuales":
        data.redes?.length > 0 ? data.redes.join(", ") : "nothing",
      "Por que el cambio": data.problemaActual || "nothing",
      "Nombre del Negocio": data.nombreMarca || "nothing",
      "Personalidad de la Marca":
        data.personalidadMarca?.length > 0
          ? data.personalidadMarca.join(", ")
          : "nothing",
      "Tipo de Logo": data.tipoLogo || "nothing",
      "Abierto a Sugerencias": data.abiertoSugerencias ? "Si" : "No",
      Presupuesto: data.presupuesto || "nothing",
      "Informacion extra": data.adicional || "nothing",
      Servicios: data.servicios || "nothing",
      "dia de reunion": data.diaReunion || "nothing",
    };

    try {
      const formId = 26;
      const response = await fetch(`/api/contact-gestiono/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: submitData }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        reset();
      } else {
        console.error("Error al enviar el formulario:", result);
        alert(
          "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.",
        );
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert(
        "Hubo un error de conexión. Por favor, verifica tu internet e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className=" text-white min-h-screen font-sans relative">
      <div className="relative max-w-3xl mx-auto px-5 py-10 lg:py-16 z-10">
        {!showSuccess ? (
          <>
            {/* Header */}
            <header className="text-center mb-12 animate-fadeInDown">
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
                Brief de Marca
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Cuéntanos sobre tu visión de marca
              </p>
            </header>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                <span>
                  Paso {currentStep} de {totalSteps}
                </span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00d9ff] to-[#00b8d4] transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Form Steps */}
            <form
              onSubmit={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                // Prevenir submit al presionar Enter
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
            >
              {/* Step 1: Información Personal */}
              {currentStep === 1 && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    Información Personal
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Necesitamos conocerte mejor
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label
                        htmlFor="nombreCompleto"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿Cuál es tu nombre completo?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombreCompleto"
                        placeholder="Tu nombre completo"
                        {...register("nombreCompleto", { required: true })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      />
                      {errors.nombreCompleto && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="whatsapp"
                        className="block text-sm font-medium mb-2.5"
                      >
                        Número de WhatsApp{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <input
                        type="tel"
                        id="whatsapp"
                        placeholder="+1 (809) 000-0000"
                        {...register("whatsapp", {
                          required: true,
                        })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Incluye código de país (ej: +1, +34, +52)
                      </p>
                      {errors.whatsapp && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
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
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label
                        htmlFor="pais"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿En qué país se desarrollará el negocio?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>

                      {/* Select con búsqueda */}
                      <div className="relative">
                        <input
                          type="text"
                          id="pais"
                          placeholder="Buscar país..."
                          value={searchPais || formData.pais || ""}
                          onChange={(e) => {
                            setSearchPais(e.target.value);
                            setIsDropdownOpen(true);
                            // Si el usuario escribe, limpiamos la selección actual
                            if (
                              formData.pais &&
                              e.target.value !== formData.pais
                            ) {
                              setValue("pais", "");
                            }
                          }}
                          onFocus={() => setIsDropdownOpen(true)}
                          className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                        />

                        {/* Hidden input for form validation */}
                        <input
                          type="hidden"
                          {...register("pais", { required: true })}
                        />

                        {/* Dropdown de países */}
                        {isDropdownOpen && (
                          <>
                            {/* Backdrop para cerrar */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setSearchPais("");
                              }}
                            />

                            <div className="absolute z-20 w-full mt-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                              {PAISES.filter((pais) =>
                                pais
                                  .toLowerCase()
                                  .includes((searchPais || "").toLowerCase()),
                              ).length > 0 ? (
                                PAISES.filter((pais) =>
                                  pais
                                    .toLowerCase()
                                    .includes((searchPais || "").toLowerCase()),
                                ).map((pais) => (
                                  <button
                                    key={pais}
                                    type="button"
                                    onClick={() => {
                                      setValue("pais", pais);
                                      clearErrors("pais");
                                      setSearchPais("");
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-[#00d9ff]/10 hover:text-[#00d9ff] transition-colors ${
                                      formData.pais === pais
                                        ? "bg-[#00d9ff]/5 text-[#00d9ff]"
                                        : "text-white"
                                    }`}
                                  >
                                    {pais}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-gray-500 text-sm">
                                  No se encontraron países
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Mostrar el país seleccionado */}
                      {formData.pais && !isDropdownOpen && (
                        <div className="mt-2 px-3 py-2 bg-[#00d9ff]/10 border border-[#00d9ff]/30 rounded-lg text-sm text-[#00d9ff] flex items-center justify-between">
                          <span>Seleccionado: {formData.pais}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setValue("pais", "");
                              setSearchPais("");
                            }}
                            className="ml-2 text-[#00d9ff] hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {errors.pais && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2.5">
                        ¿El negocio es en sociedad?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                          <input
                            type="radio"
                            value="si"
                            {...register("enSociedad", { required: true })}
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                          />
                          <span className="text-sm">Sí, es una sociedad</span>
                        </label>
                        <label className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                          <input
                            type="radio"
                            value="no"
                            {...register("enSociedad", { required: true })}
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                          />
                          <span className="text-sm">No, es individual</span>
                        </label>
                      </div>
                      {errors.enSociedad && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Tipo de Proyecto */}
              {currentStep === 2 && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">Tipo de Proyecto</h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Ayúdanos a entender tu necesidad
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label className="block text-sm font-medium mb-4">
                        ¿Es un nuevo logo o ya tenías una marca anteriormente?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start px-4 py-4 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all group">
                          <input
                            type="radio"
                            value="nuevo"
                            {...register("tipoProyecto", { required: true })}
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform mt-0.5"
                          />
                          <div>
                            <span className="text-sm font-semibold block mb-1">
                              Es un nuevo logo
                            </span>
                            <span className="text-xs text-gray-400">
                              Estoy creando una marca desde cero
                            </span>
                          </div>
                        </label>
                        <label className="flex items-start px-4 py-4 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all group">
                          <input
                            type="radio"
                            value="rebranding"
                            {...register("tipoProyecto", { required: true })}
                            className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-full mr-3 cursor-pointer transition-all checked:border-[#00d9ff] relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[#00d9ff] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform mt-0.5"
                          />
                          <div>
                            <span className="text-sm font-semibold block mb-1">
                              Es un rebranding
                            </span>
                            <span className="text-xs text-gray-400">
                              Ya tengo una marca y necesito renovarla
                            </span>
                          </div>
                        </label>
                      </div>
                      {errors.tipoProyecto && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Redes Actuales (Solo si es Rebranding) */}
              {currentStep === 3 && formData.tipoProyecto === "rebranding" && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    Redes Sociales Actuales
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Selecciona las redes sociales donde tienes presencia
                  </p>

                  <div className="space-y-3">
                    {[
                      { value: "instagram", label: "Instagram" },
                      { value: "facebook", label: "Facebook" },
                      { value: "tiktok", label: "TikTok" },
                      { value: "linkedin", label: "LinkedIn" },
                      { value: "youtube", label: "YouTube" },
                      { value: "twitter", label: "Twitter/X" },
                      { value: "website", label: "Sitio Web" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={watch("redes").includes(option.value)}
                          onChange={() =>
                            handleCheckboxChange("redes", option.value)
                          }
                          className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Problema Actual (Solo si es Rebranding) */}
              {currentStep === 4 && formData.tipoProyecto === "rebranding" && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    ¿Por qué el cambio?
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Cuéntanos qué problemas presenta tu marca actual
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label
                        htmlFor="problemaActual"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿Qué problema presentó que se debe cambiar el logo?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <textarea
                        id="problemaActual"
                        placeholder="Ej: El logo se ve anticuado, no representa nuestros valores actuales..."
                        rows={5}
                        {...register("problemaActual", {
                          required: formData.tipoProyecto === "rebranding",
                        })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[150px]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Sé específico sobre lo que no funciona con tu identidad
                        actual
                      </p>
                      {errors.problemaActual && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 (rebranding) or Step 3 (nuevo): Información de Marca */}
              {((currentStep === 3 && formData.tipoProyecto === "nuevo") ||
                (currentStep === 5 &&
                  formData.tipoProyecto === "rebranding")) && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    Información de Marca
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Comencemos con lo esencial
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label
                        htmlFor="nombreMarca"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿Cuál es el nombre de tu marca?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombreMarca"
                        placeholder="Nombre de la marca"
                        {...register("nombreMarca", { required: true })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      />
                      {errors.nombreMarca && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2.5">
                        ¿Cómo describirías la personalidad de tu marca?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <div className="space-y-3">
                        {[
                          {
                            value: "profesional",
                            label: "Profesional y seria",
                          },
                          { value: "amigable", label: "Amigable y accesible" },
                          {
                            value: "innovadora",
                            label: "Innovadora y moderna",
                          },
                          {
                            value: "elegante",
                            label: "Elegante y sofisticada",
                          },
                          { value: "divertida", label: "Divertida y juvenil" },
                          {
                            value: "tradicional",
                            label: "Tradicional y confiable",
                          },
                          { value: "aventurera", label: "Aventurera y audaz" },
                          {
                            value: "minimalista",
                            label: "Minimalista y limpia",
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={watch("personalidadMarca").includes(
                                option.value,
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  "personalidadMarca",
                                  option.value,
                                )
                              }
                              className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.personalidadMarca && (
                        <div className="text-red-500 text-xs mt-1 text-center w-full">
                          Debes seleccionar al menos una personalidad
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-4">
                        ¿Qué tipo de logo prefieres?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            value: "logotipo",
                            label: "Logotipo",
                            sub: "Solo texto",
                            letter: "A",
                            image: "/logos/Murcia.png",
                          },
                          {
                            value: "logotipo-accesorio",
                            label: "Logotipo con accesorio",
                            sub: "Texto + Ícono Integrado",
                            letter: "B",
                            image: "/logos/Nutriopcion.png",
                          },
                          {
                            value: "simbolo",
                            label: "Solo símbolo",
                            sub: "Ícono independiente",
                            letter: "C",
                            image: "/logos/CafeLogo.png",
                          },
                          {
                            value: "logo-simbolo",
                            label: "Logo-Símbolo",
                            sub: "Combinado",
                            letter: "D",
                            image: "/logos/Punto de Sabor.png",
                          },
                          {
                            value: "personaje",
                            label: "Mascota / Personaje",
                            sub: "Ilustración",
                            letter: "E",
                            image: "/logos/Captus.png",
                          },
                          {
                            value: "fondo",
                            label: "Logo con fondo",
                            sub: "Logo con fondo",
                            letter: "F",
                            image: "/logos/PlanBLogo.png",
                          },
                        ].map((type) => (
                          <label
                            key={type.value}
                            className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all border-[#00d9ff] bg-[#00d9ff]/5`}
                          >
                            <input
                              type="radio"
                              value={type.value}
                              {...register("tipoLogo", { required: true })}
                              className="sr-only"
                            />
                            <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-6">
                              {type.image ? (
                                <div
                                  className={`relative w-full h-full flex items-center justify-center bg-white rounded-lg p-4`}
                                >
                                  <Image
                                    src={type.image}
                                    alt={type.label}
                                    width={200}
                                    height={150}
                                    className="object-contain max-w-full max-h-full"
                                    style={{ filter: "brightness(1.1)" }}
                                  />
                                </div>
                              ) : (
                                // Placeholder para "Abierto a sugerencias"
                                <div className="text-center text-white/50 text-sm">
                                  {type.label}
                                </div>
                              )}
                            </div>
                            <div
                              className={`px-4 py-3 bg-black/50 backdrop-blur-sm flex items-center gap-2 ${
                                watch("tipoLogo") === type.value
                                  ? "text-[#00d9ff]"
                                  : "text-white"
                              }`}
                            >
                              <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                                {type.letter}
                              </span>
                              <span className="text-sm font-medium">
                                {type.label}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.tipoLogo && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center px-4 py-4 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                        <input
                          type="checkbox"
                          checked={watch("abiertoSugerencias") || false}
                          onChange={(e) =>
                            setValue("abiertoSugerencias", e.target.checked)
                          }
                          className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                        />
                        <div>
                          <span className="text-sm font-semibold block mb-1">
                            Abierto a sugerencias del diseñador
                          </span>
                          <span className="text-xs text-gray-400">
                            Confío en la experiencia del equipo creativo para
                            explorar opciones
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6 (rebranding) or Step 4 (nuevo): Presupuesto y Reunión */}
              {((currentStep === 4 && formData.tipoProyecto === "nuevo") ||
                (currentStep === 6 &&
                  formData.tipoProyecto === "rebranding")) && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    Presupuesto y Reunión
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Ayúdanos a prepararnos para nuestra reunión
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label
                        htmlFor="presupuesto"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿Cuál es tu presupuesto aproximado?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <select
                        id="presupuesto"
                        {...register("presupuesto", { required: true })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      >
                        <option value="" className="bg-[#0a0a0a]">
                          Selecciona un rango
                        </option>
                        <option value="500-1000" className="bg-[#0a0a0a]">
                          $500 - $1,000
                        </option>
                        <option value="1000-2500" className="bg-[#0a0a0a]">
                          $1,000 - $2,500
                        </option>
                        <option value="2500-5000" className="bg-[#0a0a0a]">
                          $2,500 - $5,000
                        </option>
                        <option value="5000+" className="bg-[#0a0a0a]">
                          $5,000+
                        </option>
                      </select>
                      {errors.presupuesto && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="diaReunion"
                        className="block text-sm font-medium mb-2.5"
                      >
                        ¿Qué día prefieres para la reunión?{" "}
                        <span className="text-[#00d9ff]">*</span>
                      </label>
                      <input
                        type="date"
                        id="diaReunion"
                        placeholder="Ej: Lunes, Martes, cualquier día..."
                        {...register("diaReunion", { required: true })}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                      />
                      {errors.diaReunion && (
                        <p className="text-red-500 text-xs mt-1">
                          Este campo es requerido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7 (rebranding) or Step 5 (nuevo): Información Adicional */}
              {((currentStep === 5 && formData.tipoProyecto === "nuevo") ||
                (currentStep === 7 &&
                  formData.tipoProyecto === "rebranding")) && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-2">
                    Información Adicional
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    ¿Algo más que debamos saber?
                  </p>

                  <div className="space-y-7">
                    <div>
                      <label
                        htmlFor="servicios"
                        className="block text-sm font-medium mb-2.5"
                      >
                        Servicios adicionales (opcional)
                      </label>
                      <textarea
                        id="servicios"
                        placeholder="Ej: Diseño de tarjetas, redes sociales, sitio web..."
                        rows={3}
                        {...register("servicios")}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="adicional"
                        className="block text-sm font-medium mb-2.5"
                      >
                        Información adicional (opcional)
                      </label>
                      <textarea
                        id="adicional"
                        placeholder="Cualquier información adicional que quieras compartir..."
                        rows={4}
                        {...register("adicional")}
                        className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-4 rounded-xl border border-white/20 transition-all"
                  >
                    ← Anterior
                  </button>
                )}

                {/* Mostrar botón Siguiente o Enviar según el paso actual */}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Brief"}
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          /* Success Message */
          <div className="text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 lg:p-16 animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#00d9ff]/10 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#00d9ff]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">¡Excelente!</h2>
            <p className="text-gray-300 text-lg mb-3 max-w-xl mx-auto">
              Analizaremos en breve tu brief y te daremos seguimiento por
              WhatsApp.
            </p>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Si gustas puedes seguir explorando las soluciones que ofrecemos en
              nuestra web.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="http://estudiocdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#00d9ff] text-black font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1"
              >
                Visitar nuestra web
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all"
              >
                Enviar otro brief
              </button>
            </div>
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
      `}</style>
    </div>
  );
}
