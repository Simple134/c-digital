"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

// Define the shape of our form data matching the user's requirements
interface BriefBrandFormData {
    // Información Personal y de Contacto
    nombreCompleto: string;
    whatsapp: string;
    email: string;
    pais: string;
    enSociedad: string;

    // Tipo de Proyecto
    tipoProyecto: string; // 'nuevo' | 'rebranding'

    // Solo para Rebranding
    redesSociales: {
        instagram: string;
        facebook: string;
        tiktok: string;
        linkedin: string;
        youtube: string;
        website: string;
        otro: string;
    };
    problemaActual: string;

    // Información Básica
    nombreMarca: string;
    industria: string;
    audienciaObjetivo: string;

    // Valores y Personalidad
    valoresNucleo: string;
    personalidadMarca: string[];
    emocionTransmitir: string;

    // Competencia
    competidores: string;
    diferenciaCompetencia: string;

    // Estilo Visual
    coloresFavoritos: string;
    coloresEvitar: string;
    estiloVisual: string[];
    referenciasMarcas: string;

    // Elementos de Marca
    tipoLogo: string;
    elementosIncluir: string;
    usoPrincipal: string[];

    // Mensaje
    eslogan: string;
    mensajeClave: string;

    // Información Adicional (internal use logic for budget/timeline was in original, respecting new payload)
    presupuesto: string; // Not explicitly in new UI but in data structure provided
    tiempoEntrega: string; // Not explicitly in new UI but in data structure provided
    adicional: string;
}

export default function BriefBrandForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        trigger,
        formState: { errors }
    } = useForm<BriefBrandFormData>({
        shouldUnregister: false, // Keep data even when fields are hidden
        defaultValues: {
            personalidadMarca: [],
            estiloVisual: [],
            usoPrincipal: [],
            redesSociales: {
                instagram: '',
                facebook: '',
                tiktok: '',
                linkedin: '',
                youtube: '',
                website: '',
                otro: ''
            },
            tipoProyecto: ''
        }
    });

    const formData = watch(); // Watch all fields to update UI reactively

    // Helper to determine total steps based on project type
    // Default to 10 if not selected, or dynamic based on logic
    const getMaxSteps = () => {
        if (formData.tipoProyecto === 'nuevo') return 8;
        return 10;
    };

    const totalSteps = getMaxSteps();

    const formatWhatsApp = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
        if (cleaned.length <= 9) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatWhatsApp(e.target.value);
        setValue('whatsapp', formatted);
    };

    const handleCheckboxChange = (fieldName: keyof BriefBrandFormData, value: string) => {
        // We know these specific fields are arrays of strings based on our interface
        const currentArray = (getValues(fieldName) as string[]) || [];

        if (currentArray.includes(value)) {
            setValue(fieldName, currentArray.filter((item) => item !== value) as any);
        } else {
            setValue(fieldName, [...currentArray, value] as any);
        }
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = async () => {
        // Optional: Add step-by-step validation here if strict validation is needed
        // const result = await trigger(['fieldName1', 'fieldName2']);
        // if (!result) return;

        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    };

    const onSubmit: SubmitHandler<BriefBrandFormData> = async (data) => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact-gestiono', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data }),
            });

            const result = await response.json();

            if (response.ok) {
                setShowSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.error("Error al enviar el formulario:", result);
                alert("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("Hubo un error de conexión. Por favor, verifica tu internet e inténtalo de nuevo.");
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
                            <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">Brief de Marca</h1>
                            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Cuéntanos sobre tu visión de marca</p>
                        </header>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                                <span>Paso {currentStep} de {totalSteps}</span>
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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Step 1: Información Personal */}
                            {currentStep === 1 && (
                                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                    <h2 className="text-2xl font-bold mb-2">Información Personal</h2>
                                    <p className="text-gray-400 text-sm mb-8">Necesitamos conocerte mejor</p>

                                    <div className="space-y-7">
                                        <div>
                                            <label htmlFor="nombreCompleto" className="block text-sm font-medium mb-2.5">
                                                ¿Cuál es tu nombre completo? <span className="text-[#00d9ff]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="nombreCompleto"
                                                placeholder="Tu nombre completo"
                                                {...register("nombreCompleto", { required: true })}
                                                className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                            />
                                            {errors.nombreCompleto && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="whatsapp" className="block text-sm font-medium mb-2.5">
                                                Número de WhatsApp <span className="text-[#00d9ff]">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="whatsapp"
                                                placeholder="+1 (809) 000-0000"
                                                {...register("whatsapp", { required: true, onChange: handleWhatsAppChange })}
                                                className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Incluye código de país (ej: +1, +34, +52)</p>
                                            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2.5">
                                                Correo electrónico <span className="text-[#00d9ff]">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="tu@email.com"
                                                {...register("email", { required: true })}
                                                className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="pais" className="block text-sm font-medium mb-2.5">
                                                ¿En qué país se desarrollará el negocio? <span className="text-[#00d9ff]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="pais"
                                                placeholder="Ej: República Dominicana, España, México..."
                                                {...register("pais", { required: true })}
                                                className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                            />
                                            {errors.pais && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2.5">
                                                ¿El negocio es en sociedad? <span className="text-[#00d9ff]">*</span>
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
                                            {errors.enSociedad && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Tipo de Proyecto */}
                            {currentStep === 2 && (
                                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                    <h2 className="text-2xl font-bold mb-2">Tipo de Proyecto</h2>
                                    <p className="text-gray-400 text-sm mb-8">Ayúdanos a entender tu necesidad</p>

                                    <div className="space-y-7">
                                        <div>
                                            <label className="block text-sm font-medium mb-4">
                                                ¿Es un nuevo logo o ya tenías una marca anteriormente? <span className="text-[#00d9ff]">*</span>
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
                                                        <span className="text-sm font-semibold block mb-1">Es un nuevo logo</span>
                                                        <span className="text-xs text-gray-400">Estoy creando una marca desde cero</span>
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
                                                        <span className="text-sm font-semibold block mb-1">Es un rebranding</span>
                                                        <span className="text-xs text-gray-400">Ya tengo una marca y necesito renovarla</span>
                                                    </div>
                                                </label>
                                            </div>
                                            {errors.tipoProyecto && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Redes Sociales (Solo si es Rebranding) */}
                            {currentStep === 3 && formData.tipoProyecto === 'rebranding' && (
                                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                    <h2 className="text-2xl font-bold mb-2">Redes Sociales Actuales</h2>
                                    <p className="text-gray-400 text-sm mb-8">Comparte tus canales digitales para conocer tu marca actual</p>

                                    <div className="space-y-5">
                                        {[
                                            { name: 'instagram', label: 'Instagram', color: '#E4405F', iconPath: "M12 2.163c3.204....." }, // Placeholder path handled below by simpler SVG
                                            { name: 'facebook', label: 'Facebook', color: '#1877F2' },
                                            { name: 'tiktok', label: 'TikTok', color: 'currentColor' },
                                            { name: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
                                            { name: 'youtube', label: 'YouTube', color: '#FF0000' },
                                            { name: 'website', label: 'Sitio Web', color: '#00d9ff' },
                                            { name: 'otro', label: 'Otro (opcional)', color: 'currentColor' }
                                        ].map((network) => (
                                            <div key={network.name}>
                                                <label htmlFor={network.name} className="block text-sm font-medium mb-2.5 flex items-center gap-2 capitalize">
                                                    {/* Simplified Visuals for brevity */}
                                                    {network.label}
                                                </label>
                                                <input
                                                    type="url"
                                                    id={network.name}
                                                    placeholder={`https://${network.name}.com/...`}
                                                    {...register(`redesSociales.${network.name}` as any)}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                            </div>
                                        ))}
                                        <p className="text-xs text-gray-500 mt-4">💡 Estos enlaces nos ayudarán a entender tu marca actual</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Problema Actual (Solo si es Rebranding) */}
                            {currentStep === 4 && formData.tipoProyecto === 'rebranding' && (
                                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                    <h2 className="text-2xl font-bold mb-2">¿Por qué el cambio?</h2>
                                    <p className="text-gray-400 text-sm mb-8">Cuéntanos qué problemas presenta tu marca actual</p>

                                    <div className="space-y-7">
                                        <div>
                                            <label htmlFor="problemaActual" className="block text-sm font-medium mb-2.5">
                                                ¿Qué problema presentó que se debe cambiar el logo? <span className="text-[#00d9ff]">*</span>
                                            </label>
                                            <textarea
                                                id="problemaActual"
                                                placeholder="Ej: El logo se ve anticuado, no representa nuestros valores actuales..."
                                                rows={5}
                                                {...register("problemaActual", { required: formData.tipoProyecto === 'rebranding' })}
                                                className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[150px]"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Sé específico sobre lo que no funciona con tu identidad actual</p>
                                            {errors.problemaActual && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información Básica */}
                            {((currentStep === 3 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 5 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Información Básica</h2>
                                        <p className="text-gray-400 text-sm mb-8">Comencemos con lo esencial</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label htmlFor="nombreMarca" className="block text-sm font-medium mb-2.5">
                                                    ¿Cuál es el nombre de tu marca? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="nombreMarca"
                                                    placeholder="Nombre de la marca"
                                                    {...register("nombreMarca", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                                {errors.nombreMarca && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="industria" className="block text-sm font-medium mb-2.5">
                                                    ¿A qué industria o sector pertenece? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="industria"
                                                    placeholder="Ej: Tecnología, Salud, Moda..."
                                                    {...register("industria", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                                {errors.industria && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="audienciaObjetivo" className="block text-sm font-medium mb-2.5">
                                                    ¿Quién es tu audiencia objetivo? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <textarea
                                                    id="audienciaObjetivo"
                                                    placeholder="Describe tu público objetivo: edad, género, intereses, comportamiento..."
                                                    rows={4}
                                                    {...register("audienciaObjetivo", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[120px]"
                                                />
                                                {errors.audienciaObjetivo && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Valores y Personalidad */}
                            {((currentStep === 4 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 6 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Valores y Personalidad</h2>
                                        <p className="text-gray-400 text-sm mb-8">Define la esencia de tu marca</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label htmlFor="valoresNucleo" className="block text-sm font-medium mb-2.5">
                                                    ¿Cuáles son los valores núcleo de tu marca? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <textarea
                                                    id="valoresNucleo"
                                                    placeholder="Ej: Innovación, Sostenibilidad, Calidad, Confianza..."
                                                    rows={3}
                                                    {...register("valoresNucleo", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y"
                                                />
                                                {errors.valoresNucleo && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2.5">
                                                    ¿Cómo describirías la personalidad de tu marca? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <div className="space-y-3">
                                                    {[
                                                        { value: 'profesional', label: 'Profesional y seria' },
                                                        { value: 'amigable', label: 'Amigable y accesible' },
                                                        { value: 'innovadora', label: 'Innovadora y moderna' },
                                                        { value: 'elegante', label: 'Elegante y sofisticada' },
                                                        { value: 'divertida', label: 'Divertida y juvenil' },
                                                        { value: 'tradicional', label: 'Tradicional y confiable' },
                                                        { value: 'aventurera', label: 'Aventurera y audaz' },
                                                        { value: 'minimalista', label: 'Minimalista y limpia' }
                                                    ].map(option => (
                                                        <label key={option.value} className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={watch('personalidadMarca').includes(option.value)}
                                                                onChange={() => handleCheckboxChange('personalidadMarca', option.value)}
                                                                className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                                                            />
                                                            <span className="text-sm">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="emocionTransmitir" className="block text-sm font-medium mb-2.5">
                                                    ¿Qué emoción quieres que tu marca transmita? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="emocionTransmitir"
                                                    placeholder="Ej: Confianza, Inspiración, Alegría, Seguridad..."
                                                    {...register("emocionTransmitir", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                                {errors.emocionTransmitir && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Competencia */}
                            {((currentStep === 5 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 7 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Análisis de Competencia</h2>
                                        <p className="text-gray-400 text-sm mb-8">Ayúdanos a entender tu mercado</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label htmlFor="competidores" className="block text-sm font-medium mb-2.5">
                                                    ¿Quiénes son tus principales competidores? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <textarea
                                                    id="competidores"
                                                    placeholder="Lista de competidores directos o indirectos..."
                                                    rows={3}
                                                    {...register("competidores", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y"
                                                />
                                                {errors.competidores && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="diferenciaCompetencia" className="block text-sm font-medium mb-2.5">
                                                    ¿Qué te diferencia de tu competencia? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <textarea
                                                    id="diferenciaCompetencia"
                                                    placeholder="Tu propuesta de valor única, ventajas competitivas..."
                                                    rows={4}
                                                    {...register("diferenciaCompetencia", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[120px]"
                                                />
                                                {errors.diferenciaCompetencia && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Estilo Visual */}
                            {((currentStep === 6 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 8 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Estilo Visual</h2>
                                        <p className="text-gray-400 text-sm mb-8">Define la estética de tu marca</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label htmlFor="coloresFavoritos" className="block text-sm font-medium mb-2.5">
                                                    ¿Tienes colores favoritos para tu marca? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="coloresFavoritos"
                                                    placeholder="Ej: Azul marino, Dorado, Verde menta..."
                                                    {...register("coloresFavoritos", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                                {errors.coloresFavoritos && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="coloresEvitar" className="block text-sm font-medium mb-2.5">
                                                    ¿Hay colores que quieras evitar?
                                                </label>
                                                <input
                                                    type="text"
                                                    id="coloresEvitar"
                                                    placeholder="Colores que no representen tu marca..."
                                                    {...register("coloresEvitar")}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2.5">
                                                    ¿Qué estilo visual prefieres? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <div className="space-y-3">
                                                    {[
                                                        { value: 'minimalista', label: 'Minimalista y limpio' },
                                                        { value: 'moderno', label: 'Moderno y tecnológico' },
                                                        { value: 'clasico', label: 'Clásico y tradicional' },
                                                        { value: 'colorido', label: 'Colorido y vibrante' },
                                                        { value: 'elegante', label: 'Elegante y sofisticado' },
                                                        { value: 'industrial', label: 'Industrial y urbano' },
                                                        { value: 'organico', label: 'Orgánico y natural' },
                                                        { value: 'retro', label: 'Retro y vintage' }
                                                    ].map(option => (
                                                        <label key={option.value} className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={watch('estiloVisual').includes(option.value)}
                                                                onChange={() => handleCheckboxChange('estiloVisual', option.value)}
                                                                className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                                                            />
                                                            <span className="text-sm">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="referenciasMarcas" className="block text-sm font-medium mb-2.5">
                                                    ¿Hay marcas que admires estéticamente?
                                                </label>
                                                <textarea
                                                    id="referenciasMarcas"
                                                    placeholder="Marcas que te inspiran y por qué..."
                                                    rows={3}
                                                    {...register("referenciasMarcas")}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Elementos de Marca */}
                            {((currentStep === 7 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 9 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Elementos de Marca</h2>
                                        <p className="text-gray-400 text-sm mb-8">Especifica qué necesitas</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label className="block text-sm font-medium mb-4">
                                                    ¿Qué tipo de logo prefieres? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* We iterate over types to keep code smaller but user gave specific styled blocks. I will implement a few representative blocks to match their design */}
                                                    {[
                                                        { value: 'logotipo', label: 'Logotipo', sub: 'Solo texto', letter: 'A' },
                                                        { value: 'logotipo-accesorio', label: 'Logotipo con accesorio', sub: 'Texto + Ícono Integrado', letter: 'B' },
                                                        { value: 'simbolo', label: 'Solo símbolo', sub: 'Ícono independiente', letter: 'C' },
                                                        { value: 'logo-simbolo', label: 'Logo-Símbolo', sub: 'Combinado', letter: 'D' },
                                                        { value: 'personaje', label: 'Mascota / Personaje', sub: 'Ilustración', letter: 'E' },
                                                        { value: 'abierto', label: 'Abierto a sugerencias', sub: 'Creatividad libre', letter: 'F' },
                                                    ].map((type) => (
                                                        <label
                                                            key={type.value}
                                                            className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${watch('tipoLogo') === type.value
                                                                    ? 'border-[#00d9ff] bg-[#00d9ff]/5'
                                                                    : 'border-[#1a1a1a] hover:border-[#00d9ff]/50'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={type.value}
                                                                {...register("tipoLogo", { required: true })}
                                                                className="sr-only"
                                                            />
                                                            <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-6">
                                                                {/* Simplified placeholder content for visual consistency without huge SVG blocks */}
                                                                <div className="text-center text-white/50 text-sm">
                                                                    {type.label}
                                                                </div>
                                                            </div>
                                                            <div className={`px-4 py-3 bg-black/50 backdrop-blur-sm flex items-center gap-2 ${watch('tipoLogo') === type.value ? 'text-[#00d9ff]' : 'text-white'
                                                                }`}>
                                                                <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                                                                    {type.letter}
                                                                </span>
                                                                <span className="text-sm font-medium">{type.label}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.tipoLogo && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="elementosIncluir" className="block text-sm font-medium mb-2.5">
                                                    ¿Hay elementos específicos que quieras incluir en el logo?
                                                </label>
                                                <textarea
                                                    id="elementosIncluir"
                                                    placeholder="Ej: Una montaña, un árbol, formas geométricas..."
                                                    rows={3}
                                                    {...register("elementosIncluir")}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2.5">
                                                    ¿Dónde se usará principalmente tu marca? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <div className="space-y-3">
                                                    {[
                                                        { value: 'digital', label: 'Medios digitales (web, redes sociales)' },
                                                        { value: 'impreso', label: 'Material impreso (tarjetas, folletos)' },
                                                        { value: 'productos', label: 'Productos físicos (packaging, etiquetas)' },
                                                        { value: 'senaletica', label: 'Señalética (letreros, vallas)' },
                                                        { value: 'textil', label: 'Textil (uniformes, bolsas)' },
                                                        { value: 'vehiculos', label: 'Vehículos (rotulación)' }
                                                    ].map(option => (
                                                        <label key={option.value} className="flex items-center px-4 py-3.5 border border-[#1a1a1a] rounded-xl cursor-pointer hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={watch('usoPrincipal').includes(option.value)}
                                                                onChange={() => handleCheckboxChange('usoPrincipal', option.value)}
                                                                className="appearance-none w-5 h-5 min-w-[20px] border-2 border-[#1a1a1a] rounded-md mr-3 cursor-pointer transition-all checked:bg-[#00d9ff] checked:border-[#00d9ff] relative after:content-['✓'] after:absolute after:text-black after:text-sm after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition-transform"
                                                            />
                                                            <span className="text-sm">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Step 8/10: Mensaje */}
                            {((currentStep === 8 && formData.tipoProyecto === 'nuevo') ||
                                (currentStep === 10 && formData.tipoProyecto === 'rebranding')) && (
                                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 lg:p-10 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-2">Mensaje de Marca</h2>
                                        <p className="text-gray-400 text-sm mb-8">¿Qué quieres comunicar?</p>

                                        <div className="space-y-7">
                                            <div>
                                                <label htmlFor="eslogan" className="block text-sm font-medium mb-2.5">
                                                    ¿Tienes un eslogan o tagline en mente?
                                                </label>
                                                <input
                                                    type="text"
                                                    id="eslogan"
                                                    placeholder="Tu eslogan o tagline..."
                                                    {...register("eslogan")}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="mensajeClave" className="block text-sm font-medium mb-2.5">
                                                    ¿Cuál es el mensaje clave que quieres transmitir? <span className="text-[#00d9ff]">*</span>
                                                </label>
                                                <textarea
                                                    id="mensajeClave"
                                                    placeholder="El mensaje principal que tu audiencia debe recordar..."
                                                    rows={4}
                                                    {...register("mensajeClave", { required: true })}
                                                    className="w-full px-4 py-3.5 bg-transparent border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] resize-y min-h-[120px]"
                                                />
                                                {errors.mensajeClave && <p className="text-red-500 text-xs mt-1">Este campo es requerido</p>}
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

                                {/* Determinar si es el último paso basado en el tipo de proyecto */}
                                {((formData.tipoProyecto === 'nuevo' && currentStep < 8) ||
                                    (formData.tipoProyecto === 'rebranding' && currentStep < 10) ||
                                    (formData.tipoProyecto === '' && currentStep < 10)) ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        // Disable next on step 2 if no selection logic could go here, but validation is better
                                        className="flex-1 bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        Siguiente →
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-[#00d9ff] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00d9ff]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar Brief'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                ) : (
                    /* Success Message */
                    <div className="text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 lg:p-16 animate-fadeIn">
                        <div className="w-20 h-20 mx-auto mb-6 bg-[#00d9ff]/10 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-[#00d9ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">¡Excelente!</h2>
                        <p className="text-gray-300 text-lg mb-3 max-w-xl mx-auto">
                            Analizaremos en breve tu brief y te daremos seguimiento por WhatsApp.
                        </p>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            Si gustas puedes seguir explorando las soluciones que ofrecemos en nuestra web.
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
          from { opacity: 0; }
          to { opacity: 1; }
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
};
