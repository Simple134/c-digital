"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  badge: "free" | "premium";
  meta1: string;
  meta2: string;
  downloadUrl: string;
  price?: string;
}

export default function RecursosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [email, setEmail] = useState("");

  // Featured resource
  const featuredResource: Resource = {
    id: "featured",
    title: "Guía Completa de Marketing Digital 2026",
    description:
      "Estrategias probadas, casos de éxito y frameworks completos para dominar el marketing digital. Incluye plantillas descargables y checklist de implementación.",
    category: "Ebook Exclusivo",
    icon: "📊",
    badge: "free",
    meta1: "📄 127 páginas",
    meta2: "⭐ 4.9/5",
    downloadUrl: "#",
  };

  // Resources data
  const resources: Resource[] = [
    {
      id: "1",
      title: "Plan de Contenido Social Media",
      description:
        "Plantilla completa en Excel para planificar tu contenido mensual en redes sociales con calendario editorial integrado.",
      category: "Plantilla",
      icon: "📋",
      badge: "free",
      meta1: "📊 Excel",
      meta2: "2.3k descargas",
      downloadUrl: "#",
    },
    {
      id: "2",
      title: "Brand Identity Toolkit",
      description:
        "Más de 50 plantillas editables de Figma para crear tu identidad de marca completa: logos, paletas, tipografías y mockups.",
      category: "Kit de Diseño",
      icon: "🎨",
      badge: "premium",
      meta1: "🎨 Figma",
      meta2: "$49",
      downloadUrl: "#",
      price: "$49",
    },
    {
      id: "3",
      title: "Automatización de Email Marketing",
      description:
        "Diagrama de flujo completo para automatizar tus campañas de email con secuencias de bienvenida, nurturing y conversión.",
      category: "Flujo de Trabajo",
      icon: "⚡",
      badge: "free",
      meta1: "🔄 PDF",
      meta2: "1.8k descargas",
      downloadUrl: "#",
    },
    {
      id: "4",
      title: "SEO Local para Pymes",
      description:
        "Estrategias específicas para posicionar tu negocio local en Google. Incluye checklist de optimización y casos de estudio.",
      category: "Ebook",
      icon: "📈",
      badge: "free",
      meta1: "📄 45 páginas",
      meta2: "⭐ 4.8/5",
      downloadUrl: "#",
    },
    {
      id: "5",
      title: "Dashboard de Métricas Completo",
      description:
        "Google Sheets profesional con fórmulas automatizadas para rastrear todas tus métricas de marketing en un solo lugar.",
      category: "Plantilla",
      icon: "💰",
      badge: "premium",
      meta1: "📊 Sheets",
      meta2: "$29",
      downloadUrl: "#",
      price: "$29",
    },
    {
      id: "6",
      title: "Guía de Facebook Ads 2026",
      description:
        "Estrategias actualizadas para crear campañas rentables en Meta. Incluye estructura de campañas y copywriting efectivo.",
      category: "Guía",
      icon: "🎯",
      badge: "free",
      meta1: "📱 PDF",
      meta2: "3.1k descargas",
      downloadUrl: "#",
    },
    {
      id: "7",
      title: "50 Prompts de Copywriting con IA",
      description:
        "Colección de prompts probados para ChatGPT y Claude que generan copy de alta conversión para anuncios, emails y landing pages.",
      category: "Plantilla",
      icon: "✍️",
      badge: "free",
      meta1: "🤖 Notion",
      meta2: "4.2k descargas",
      downloadUrl: "#",
    },
    {
      id: "8",
      title: "Masterclass: Growth Marketing",
      description:
        "6 horas de contenido en video sobre estrategias de crecimiento rápido. Incluye plantillas, frameworks y sesiones de Q&A.",
      category: "Curso",
      icon: "🚀",
      badge: "premium",
      meta1: "🎥 Video",
      meta2: "$149",
      downloadUrl: "#",
      price: "$149",
    },
    {
      id: "9",
      title: "10 Secuencias de Email Persuasivo",
      description:
        "Plantillas de email marketing listas para usar en diferentes etapas del funnel. Personalízalas y empieza a enviar.",
      category: "Plantilla",
      icon: "📧",
      badge: "free",
      meta1: "📧 Docs",
      meta2: "2.7k descargas",
      downloadUrl: "#",
    },
    {
      id: "10",
      title: "Video Marketing Starter Pack",
      description:
        "Todo lo necesario para crear videos profesionales: scripts, storyboards, guías de edición y plantillas de After Effects.",
      category: "Pack Completo",
      icon: "🎬",
      badge: "premium",
      meta1: "🎬 Bundle",
      meta2: "$79",
      downloadUrl: "#",
      price: "$79",
    },
    {
      id: "11",
      title: "Auditoría Completa de Instagram",
      description:
        "Checklist exhaustiva de 100+ puntos para optimizar tu perfil de Instagram y aumentar engagement orgánicamente.",
      category: "Checklist",
      icon: "📱",
      badge: "free",
      meta1: "✅ PDF",
      meta2: "5.1k descargas",
      downloadUrl: "#",
    },
  ];

  const filterTabs = [
    "Todos",
    "Ebooks",
    "Plantillas",
    "Flujos",
    "Guías",
    "Herramientas",
    "Gratis",
    "Premium",
  ];

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "Todos" ||
      resource.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
      (activeFilter === "Gratis" && resource.badge === "free") ||
      (activeFilter === "Premium" && resource.badge === "premium");

    return matchesSearch && matchesFilter;
  });

  const handleDownload = (resource: Resource) => {
    if (resource.badge === "premium") {
      alert(`🛒 Redirigiendo al checkout para: ${resource.title}`);
    } else {
      alert(`✅ Descargando: ${resource.title}`);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`🎉 ¡Gracias por suscribirte! Confirma tu email: ${email}`);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[rgba(0,102,255,0.1)] border border-[rgba(0,102,255,0.3)] rounded-full text-sm font-medium text-[#0066FF] mb-6"
          >
            🎁 Recursos Gratuitos y Premium
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent font-['Sora']"
          >
            Recursos que Impulsan tu Negocio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-[700px] mb-10"
          >
            Descarga plantillas, ebooks, flujos de trabajo y herramientas
            diseñadas por expertos para transformar tu estrategia digital.
          </motion.p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-[1200px] mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-[600px] mx-auto"
        >
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-50 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveFilter("Todos");
            }}
            placeholder="Buscar ebooks, plantillas, guías..."
            className="w-full py-5 pl-16 pr-6 bg-[#1A1B23] border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-[#0066FF] focus:bg-[#0A0B0F] focus:shadow-[0_0_0_4px_rgba(0,102,255,0.1)]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#2A2B35] hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              ×
            </button>
          )}
        </motion.div>

        {searchTerm && (
          <div className="text-center mt-4 text-sm text-gray-400">
            {filteredResources.length === 0
              ? "😕 No se encontraron recursos para tu búsqueda"
              : `✨ ${filteredResources.length} recurso${filteredResources.length !== 1 ? "s" : ""} encontrado${filteredResources.length !== 1 ? "s" : ""}`}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="max-w-[1200px] mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-3 flex-wrap"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveFilter(tab);
                setSearchTerm("");
              }}
              className={`px-7 py-3 rounded-full font-medium text-[15px] transition-all duration-300 ${
                activeFilter === tab
                  ? "bg-[#0066FF] text-white border border-[#0066FF]"
                  : "bg-[#2A2B35] text-gray-400 border border-transparent hover:bg-[#1A1B23] hover:text-white hover:border-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {/* Featured Resource - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#1A1B23] to-[#2A2B35] border border-[rgba(0,102,255,0.3)] rounded-3xl overflow-hidden relative grid md:grid-cols-2 gap-0"
          >
            {/* Featured badge */}
            <div className="absolute top-5 right-[-35px] bg-[#F59E0B] text-white px-10 py-2 text-xs font-bold tracking-wider rotate-45 z-10">
              ✨ DESTACADO
            </div>

            {/* Image section */}
            <div className="relative min-h-[400px] bg-gradient-to-br from-[rgba(0,102,255,0.2)] to-[rgba(99,102,241,0.2)] flex items-center justify-center">
              <span className="text-[64px] opacity-30">
                {featuredResource.icon}
              </span>
            </div>

            {/* Content section */}
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <span className="inline-block px-3 py-1.5 bg-[rgba(99,102,241,0.1)] text-[#6366F1] rounded-md text-xs font-semibold uppercase tracking-wider mb-4">
                {featuredResource.category}
              </span>

              <h2 className="text-4xl font-bold mb-5 leading-tight font-['Sora']">
                {featuredResource.title}
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                {featuredResource.description}
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-white/10">
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>{featuredResource.meta1}</span>
                  <span>{featuredResource.meta2}</span>
                </div>
                <button
                  onClick={() => handleDownload(featuredResource)}
                  className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl font-semibold text-sm transition-all hover:scale-105"
                >
                  Descargar Gratis
                </button>
              </div>
            </div>
          </motion.div>

          {/* Regular Resources */}
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[#1A1B23] border border-white/8 rounded-3xl overflow-hidden cursor-pointer transition-all duration-400 hover:border-[rgba(0,102,255,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Image/Icon section */}
              <div className="relative h-60 bg-gradient-to-br from-[#2A2B35] to-[#1A1B23] flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,102,255,0.2),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <span className="text-[64px] opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-400">
                  {resource.icon}
                </span>

                {/* Badge */}
                <span
                  className={`absolute top-4 left-4 px-3.5 py-1.5 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wide ${
                    resource.badge === "free"
                      ? "bg-black/70 text-[#10B981] border border-[#10B981]"
                      : "bg-black/70 text-[#F59E0B] border border-[#F59E0B]"
                  }`}
                >
                  {resource.badge === "free" ? "Gratis" : "Premium"}
                </span>
              </div>

              {/* Content */}
              <div className="p-7">
                <span className="inline-block px-3 py-1.5 bg-[rgba(99,102,241,0.1)] text-[#6366F1] rounded-md text-xs font-semibold uppercase tracking-wide mb-4">
                  {resource.category}
                </span>

                <h3 className="text-2xl font-bold mb-3 leading-tight font-['Sora']">
                  {resource.title}
                </h3>

                <p className="text-gray-400 text-[15px] leading-relaxed mb-5">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-white/8">
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      {resource.meta1}
                    </span>
                    <span>{resource.meta2}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(resource)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
                      resource.badge === "premium"
                        ? "bg-[#F59E0B] hover:bg-[#D97706] text-white"
                        : "bg-[#0066FF] hover:bg-[#0052CC] text-white"
                    }`}
                  >
                    {resource.badge === "premium" ? "Obtener" : "Descargar"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-16 bg-gradient-to-br from-[#1A1B23] to-[rgba(0,102,255,0.1)] border-2 border-[rgba(0,102,255,0.2)] rounded-3xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-['Sora']">
            Recibe Recursos Exclusivos
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Suscríbete y recibe recursos premium, plantillas y estrategias
            directamente en tu inbox cada semana.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col md:flex-row gap-3 max-w-[500px] mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-6 py-4 bg-[#0A0B0F] border border-white/10 rounded-xl text-white placeholder-gray-400 outline-none transition-all focus:border-[#0066FF]"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              Suscribirme
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
