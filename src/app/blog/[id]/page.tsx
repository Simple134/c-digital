"use client";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BlogArticle() {
  const [activeSection, setActiveSection] = useState("intro");

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "intro",
        "preparacion",
        "que-hace-agencia",
        "como-elegir",
        "preguntas-criticas",
        "senales-agencia-ideal",
      ];
      const scrollPosition = window.scrollY + 150;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { id: "intro", label: "Introducción" },
    { id: "preparacion", label: "Antes de Buscar Agencia" },
    { id: "que-hace-agencia", label: "Qué Hace una Agencia" },
    { id: "como-elegir", label: "Cómo Elegir" },
    { id: "preguntas-criticas", label: "Preguntas Críticas" },
    { id: "senales-agencia-ideal", label: "Señales de Agencia Ideal" },
  ];

  return (
    <div className="relative min-h-screen ">
      <Container>
        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-20 pb-10 max-w-[900px] mx-auto"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-['Poppins'] mb-6 leading-tight">
            Guía Definitiva para Contratar una Agencia de Marketing Digital en
            2026
          </h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black rounded-full text-sm font-semibold">
                Marketing Digital
              </span>
              <span className="px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-full text-sm font-semibold">
                Guía
              </span>
              <span className="px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-full text-sm font-semibold">
                2026
              </span>
            </div>
            <span className="text-gray-400 text-sm">15 min read</span>
          </div>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[1200px] mx-auto mb-16 rounded-2xl overflow-hidden border border-[#1a1a1a]"
        >
          <Image
            src="/blog1.png"
            alt="Guía para Contratar Agencia de Marketing Digital"
            width={1200}
            height={600}
            className="w-full h-auto"
          />
        </motion.div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-20 max-w-[1400px] mx-auto pb-32">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-24 h-fit">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
              CONTENIDO:
            </div>
            <nav>
              <ul className="flex flex-col gap-4">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`text-left text-sm pl-5 border-l-2 transition-all ${
                        activeSection === item.id
                          ? "text-[#00C5FF] border-[#00C5FF] font-semibold"
                          : "text-gray-400 border-[#1a1a1a] hover:text-white hover:border-gray-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                COMPARTIR:
              </div>
              <div className="flex gap-3">
                {["facebook", "linkedin", "twitter", "link"].map((platform) => (
                  <button
                    key={platform}
                    className="w-11 h-11 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-gray-400 hover:text-[#00C5FF] hover:border-[#00C5FF] transition-all hover:-translate-y-0.5"
                    aria-label={`Share on ${platform}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Article Content */}
          <article className="max-w-[750px] text-lg leading-relaxed font-['Avenir']">
            {/* Introducción */}
            <section id="intro" className="mb-16 scroll-mt-24">
              <p className="text-xl text-gray-300 mb-6">
                Para contratar una agencia de marketing digital y diseño que
                realmente te ayude a crecer, necesitas evaluar mucho más que
                &quot;bonitos posts&quot; o un precio bajo. Este tipo de
                decisión impacta directamente en tus ventas, reputación y la
                forma en que tu marca se presenta todos los días en internet.
              </p>

              <p className="text-gray-300 mb-6">
                Según estudios recientes,{" "}
                <strong className="text-white">
                  el 78% de las pymes que trabajan con agencias especializadas
                  reportan un crecimiento del 30% o más en sus ingresos
                  digitales durante el primer año
                </strong>
                . Sin embargo, el 45% de estas mismas empresas admite haber
                contratado al menos una agencia equivocada antes de encontrar la
                correcta, perdiendo tiempo y dinero valioso.
              </p>

              <div className="bg-gradient-to-r from-[#00C5FF]/10 to-[#00FF7C]/10 border-l-4 border-[#00C5FF] p-6 rounded-lg mb-6">
                <p className="text-gray-300 m-0">
                  La realidad es que el ecosistema digital se ha vuelto
                  extremadamente competitivo. Ya no basta con &quot;estar
                  presente&quot; en redes sociales o tener un sitio web básico.
                  Las empresas que destacan son aquellas que invierten
                  estratégicamente en marketing digital profesional, con
                  objetivos claros y métricas medibles.
                </p>
              </div>

              <p className="text-gray-300">
                Esta guía te equipará con las herramientas y preguntas correctas
                para tomar una decisión informada desde el primer intento.
              </p>
            </section>

            {/* Antes de Buscar Agencia */}
            <section id="preparacion" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Antes de Buscar Agencia: La Preparación es tu Mayor Ventaja
              </h2>
              <p className="text-gray-300 mb-6">
                La mayoría de los emprendedores cometen el error de buscar
                agencia cuando ya están desesperados por resultados. Esta
                urgencia nubla el juicio y lleva a decisiones apresuradas que
                terminan siendo costosas. En su lugar, aborda esta búsqueda como
                lo que realmente es:{" "}
                <strong className="text-white">
                  una inversión estratégica a mediano y largo plazo
                </strong>{" "}
                que puede transformar completamente la trayectoria de tu
                negocio.
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Define objetivos de negocio específicos y medibles
              </h3>
              <p className="text-gray-300 mb-4">
                &quot;Quiero más ventas&quot; no es un objetivo, es un deseo
                vago. Las agencias profesionales necesitan metas concretas para
                diseñar estrategias efectivas. Pregúntate:{" "}
                <strong className="text-white">
                  ¿Qué significa realmente el éxito para mi negocio en los
                  próximos 6 meses?
                </strong>
              </p>

              <p className="text-gray-300 mb-3">
                Algunos ejemplos de objetivos bien definidos incluyen:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Aumentar ventas online en un 40% durante los próximos 6
                    meses
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Generar 150 leads calificados mensuales para el equipo
                    comercial
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Incrementar reservas directas en 25% reduciendo dependencia
                    de plataformas externas
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Posicionar la marca en el top 3 de búsquedas locales en 90
                    días
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Profesionalizar la presencia digital para competir con
                    empresas más grandes del sector
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Establece un presupuesto realista y sostenible en el tiempo
              </h3>
              <p className="text-gray-300 mb-4">
                El marketing digital no es un gasto puntual, es una inversión
                continua que genera resultados acumulativos. Los resultados
                significativos requieren constancia de{" "}
                <strong className="text-white">3 a 6 meses mínimo</strong> para:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>Construir autoridad de marca y reconocimiento</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Optimizar campañas basándose en datos reales de tu audiencia
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Generar contenido suficiente para alimentar el funnel
                    completo de ventas
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Mejorar posicionamiento orgánico (el SEO requiere paciencia
                    pero genera resultados duraderos)
                  </span>
                </li>
              </ul>

              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 my-8">
                <h4 className="text-white font-bold mb-4">
                  Referencia de inversión mensual según tamaño de empresa:
                </h4>
                <ul className="space-y-3">
                  <li className="text-gray-300">
                    <strong className="text-white">
                      Microempresas y emprendedores:
                    </strong>{" "}
                    $500-$1,500 mensuales para gestión básica de redes sociales
                    más publicidad limitada
                  </li>
                  <li className="text-gray-300">
                    <strong className="text-white">Pequeñas empresas:</strong>{" "}
                    $1,500-$4,000 mensuales para una estrategia integral que
                    incluya múltiples canales
                  </li>
                  <li className="text-gray-300">
                    <strong className="text-white">Medianas empresas:</strong>{" "}
                    $4,000-$10,000 o más mensuales para estrategias avanzadas,
                    equipos dedicados y automatización completa
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Identifica tu capacidad interna versus necesidades de
                outsourcing
              </h3>
              <p className="text-gray-300 mb-4">
                No todas las empresas necesitan el mismo nivel de
                acompañamiento. Evalúa honestamente qué puedes manejar
                internamente y qué requiere experiencia especializada.
              </p>
              <p className="text-gray-300 mb-3">
                <strong className="text-white">
                  Necesitas una agencia completa si:
                </strong>
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    No tienes tiempo ni conocimiento para gestionar marketing
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Tu negocio requiere presencia constante y estratégica en
                    digital
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Necesitas resultados medibles con reportes profesionales que
                    justifiquen la inversión
                  </span>
                </li>
              </ul>
            </section>

            {/* Qué Hace Realmente una Agencia Profesional */}
            <section id="que-hace-agencia" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Qué Hace Realmente una Agencia Profesional (Más Allá de Publicar
                Contenido)
              </h2>
              <p className="text-gray-300 mb-6">
                Muchos negocios contratan &quot;community managers&quot; que
                solo publican contenido genérico sin estrategia subyacente. Una
                agencia profesional de marketing digital hace mucho más que
                llenar tu feed de Instagram con posts bonitos.
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Diseña estrategia digital basada en análisis profundo
              </h3>
              <p className="text-gray-300 mb-4">
                Antes de crear un solo post, una buena agencia:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Analiza tu modelo de negocio completo, competencia directa e
                    indirecta, y el estado actual de tu presencia digital
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Define tu buyer persona (cliente ideal) con datos
                    demográficos, psicográficos y comportamentales reales, no
                    suposiciones
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Mapea el customer journey completo desde que alguien
                    descubre tu marca hasta que se convierte en cliente fiel y
                    embajador
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Selecciona canales específicos donde realmente está tu
                    audiencia (no todos los negocios necesitan TikTok)
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Establece KPIs realistas alineados con tus objetivos
                    específicos de negocio
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Ejecuta con excelencia y optimiza constantemente
              </h3>
              <p className="text-gray-300 mb-6">
                La ejecución incluye mucho más que crear y programar contenido:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    <strong className="text-white">
                      Producción de contenido de valor real:
                    </strong>{" "}
                    posts educativos que posicionan tu expertise,
                    entretenimiento relevante, y contenido de conversión
                    diseñado para llevar a la acción
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    <strong className="text-white">Diseño profesional:</strong>{" "}
                    coherente con tu identidad de marca completa, no plantillas
                    genéricas de Canva
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    <strong className="text-white">
                      Gestión activa de comunidad:
                    </strong>{" "}
                    respuestas rápidas y personalizadas, manejo profesional de
                    crisis, construcción genuina de relaciones
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    <strong className="text-white">
                      Campañas publicitarias optimizadas:
                    </strong>{" "}
                    segmentación precisa, pruebas A/B sistemáticas, ajustes
                    diarios basados en performance real
                  </span>
                </li>
              </ul>
            </section>

            {/* Claves para Elegir la Agencia Correcta */}
            <section id="como-elegir" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Claves para Elegir la Agencia Correcta para tu Negocio
              </h2>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Experiencia relevante y portafolio verificable
              </h3>
              <p className="text-gray-300 mb-4">
                No te conformes con ver posts bonitos en Instagram. Investiga a
                fondo:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Tienen casos de éxito documentados con resultados medibles
                    y verificables?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Han trabajado con empresas de tu sector o tamaño similar?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Su propia presencia digital es profesional y coherente?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Tienen testimonios verificables y referencias que puedas
                    contactar?
                  </span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 p-6 rounded-lg my-6">
                <p className="text-gray-300 m-0">
                  <strong className="text-red-400">⚠️ Señal de alerta:</strong>{" "}
                  Agencias que muestran trabajos &quot;confidenciales&quot; sin
                  ninguna evidencia verificable, o solo tienen portafolios
                  genéricos descargados de Behance sin conexión real con
                  proyectos ejecutados.
                </p>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Transparencia y promesas realistas
              </h3>
              <p className="text-gray-300 mb-4">
                Las promesas exageradas son la señal más clara de incompetencia
                o deshonestidad.{" "}
                <strong className="text-white">
                  Desconfía rotundamente si prometen:
                </strong>
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-red-400 text-2xl leading-none mt-1">
                    ✗
                  </span>
                  <span>
                    1,000 seguidores reales en una semana (probablemente sean
                    bots)
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-red-400 text-2xl leading-none mt-1">
                    ✗
                  </span>
                  <span>
                    Estar #1 en Google en 10 días (el SEO orgánico toma meses)
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-red-400 text-2xl leading-none mt-1">
                    ✗
                  </span>
                  <span>
                    Resultados garantizados sin siquiera conocer tu negocio
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-red-400 text-2xl leading-none mt-1">
                    ✗
                  </span>
                  <span>
                    Volverse viral seguro (nadie puede garantizar viralidad)
                  </span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-l-4 border-green-500 p-6 rounded-lg my-6">
                <p className="text-gray-300 mb-3">
                  <strong className="text-green-400">
                    ✓ Una agencia profesional y honesta te dirá:
                  </strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="text-gray-300">
                    Estimamos X% de crecimiento en Y meses basado en nuestra
                    experiencia con casos similares
                  </li>
                  <li className="text-gray-300">
                    Los primeros 2 meses son de optimización y aprendizaje,
                    resultados sólidos se ven del mes 3 en adelante
                  </li>
                  <li className="text-gray-300">
                    Necesitamos conocer más profundamente tu negocio para hacer
                    una propuesta precisa y realista
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Metodología clara y medición rigurosa
              </h3>
              <p className="text-gray-300 mb-4">
                Pregunta específicamente en la primera reunión:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Cuál es su proceso completo de onboarding y planificación
                    estratégica?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Qué herramientas específicas usan para tracking, analytics
                    y reporting?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Cuáles serán los KPIs específicos para tu tipo de negocio?
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    ¿Cada cuánto reportan resultados y en qué formato?
                  </span>
                </li>
              </ul>
            </section>

            {/* Preguntas Críticas */}
            <section id="preguntas-criticas" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Preguntas Críticas que Debes Hacer en la Primera Reunión
              </h2>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                1. ¿Qué entienden ustedes como éxito en mi proyecto específico y
                cómo lo van a medir mes a mes?
              </h3>
              <p className="text-gray-300 mb-6">
                Esta pregunta revela si realmente entienden tu negocio o solo
                quieren vender servicios genéricos. Respuestas vagas como
                &quot;más visibilidad&quot; o &quot;mejor presencia online&quot;
                son completamente insuficientes.
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                2. ¿Quién será mi contacto directo y cómo funcionará la
                comunicación?
              </h3>
              <p className="text-gray-300 mb-6">
                Necesitas saber exactamente: ¿será un account manager
                intermediario o tendrás acceso directo a quien ejecuta tu
                estrategia? Pregunta sobre canales de comunicación, tiempos de
                respuesta, frecuencia de reuniones y acceso a dashboards.
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                3. ¿Qué incluye exactamente su propuesta y qué queda fuera del
                alcance?
              </h3>
              <p className="text-gray-300 mb-6">
                Esta pregunta evita sorpresas costosas después. Clarifica todo:
                ¿incluye diseño de sitio web? ¿La pauta publicitaria es un costo
                adicional? ¿Cuántos posts mensuales? ¿Incluye fotografía
                profesional? ¿Quién es dueño del contenido creado?
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                4. ¿Cuál es su proceso si los resultados no llegan según lo
                esperado?
              </h3>
              <p className="text-gray-300 mb-6">
                Agencias profesionales tienen protocolos claros de pivoteo y
                optimización. Deberían explicar cómo analizan bajo rendimiento,
                qué tipos de ajustes implementan, y en cuánto tiempo esperan ver
                mejoras.
              </p>

              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 p-6 rounded-lg my-6">
                <p className="text-gray-300 m-0">
                  <strong className="text-red-400">⚠️ Señal de alerta:</strong>{" "}
                  Si dicen &quot;eso nunca nos pasa&quot; o no tienen una
                  respuesta estructurada. Todos los proyectos atraviesan fases
                  de optimización, lo importante es cómo se manejan.
                </p>
              </div>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                5. ¿Qué pasa con mis activos digitales si decido terminar el
                contrato?
              </h3>
              <p className="text-gray-300 mb-4">
                Esto es fundamental para proteger tu inversión a largo plazo.
                Clarifica:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>Propiedad absoluta de todo el contenido creado</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Accesos administrativos completos a todas las cuentas
                    publicitarias
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Control total de bases de datos de clientes y suscriptores
                    generados
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Entrega de documentación completa de estrategia y procesos
                    implementados
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                6. ¿Pueden compartir referencias de clientes actuales o pasados
                que pueda contactar?
              </h3>
              <p className="text-gray-300 mb-6">
                Agencias confiables tienen clientes satisfechos dispuestos a dar
                referencias honestas. Si se niegan rotundamente o ponen excusas
                vagas sobre &quot;confidencialidad&quot; sin ofrecer
                alternativas, desconfía.
              </p>
            </section>

            {/* Newsletter Banner */}
            <div className="relative my-20 p-12 bg-gradient-to-br from-[#00C5FF]/10 to-[#00FF7C]/10 border-2 border-[#00C5FF]/30 rounded-3xl overflow-hidden">
              <div className="relative z-10 max-w-[600px] mx-auto text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] rounded-2xl flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-3 bg-gradient-to-r from-white to-[#00C5FF] bg-clip-text text-transparent">
                  Mantente al Día con Nosotros
                </h3>
                <p className="text-gray-400 mb-8">
                  Únete a nuestra Comunidad y recibe contenido exclusivos,
                  estrategias y actualizaciones directamente en tu inbox o
                  WhatsApp.
                </p>

                <form className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="flex-1 px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                    />
                    <input
                      type="tel"
                      placeholder="+1 (809) 000-0000"
                      className="flex-1 px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-5 py-4 bg-black/50 border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00C5FF]"
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-black font-bold rounded-xl hover:-translate-y-1 transition-transform"
                  >
                    Suscribirme Ahora
                  </button>
                  <p className="text-xs text-gray-500">
                    Al suscribirte, aceptas nuestra Política de Privacidad y
                    consientes recibir actualizaciones.
                  </p>
                </form>
              </div>
            </div>

            {/* Señales de una Agencia Ideal */}
            <section id="senales-agencia-ideal" className="mb-16 scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Señales de una Agencia Ideal para Pymes y Emprendedores
              </h2>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Hablan tu idioma sin tecnicismos innecesarios
              </h3>
              <p className="text-gray-300 mb-6">
                Una agencia profesional orientada a pymes traduce toda la jerga
                técnica compleja a impacto directo de negocio. En lugar de
                bombardearte con &quot;CPM, CTR, bounce rate, pixel de
                conversión&quot;, te explican: Tu inversión de $500 en anuncios
                generó 45 leads, 8 se convirtieron en clientes pagando $3,200
                total. Cada dólar te regresó $6.40.
              </p>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Tienen enfoque especializado en pymes y emprendedores
              </h3>
              <p className="text-gray-300 mb-4">
                Las mejores agencias para pymes entienden tus desafíos únicos:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Presupuesto limitado que requiere priorizar inversiones de
                    alto impacto
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Tiempo escaso porque estás corriendo todo el negocio
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Necesidad de ROI relativamente rápido (balancean estrategias
                    de corto plazo con construcción de largo plazo)
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Recursos humanos limitados (funcionan como extensión natural
                    de tu equipo)
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold font-['Poppins'] mt-10 mb-4">
                Se preocupan genuinamente por tu marca a largo plazo
              </h3>
              <p className="text-gray-300 mb-4">
                Una agencia que solo quiere &quot;llenar tu feed con posts&quot;
                no está pensando estratégicamente en tu crecimiento real. Busca
                agencias que:
              </p>
              <ul className="space-y-3 my-6">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Insisten en optimizar o crear tu sitio web profesional (no
                    solo gestionar redes sociales aisladamente)
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Hablan de construir tu ecosistema digital completo donde
                    todo está interconectado
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Proponen trabajar proactivamente en tu reputación online con
                    gestión de reviews y relaciones públicas digitales
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Diseñan funnels de conversión completos que acompañan al
                    cliente desde descubrimiento hasta fidelización
                  </span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-[#00C5FF] text-2xl leading-none mt-1">
                    •
                  </span>
                  <span>
                    Piensan en automatización y escalabilidad para que no
                    dependas eternamente de trabajo manual intensivo
                  </span>
                </li>
              </ul>
            </section>

            {/* Conclusión */}
            <section className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">
                Conclusión: Toma una Decisión Estratégica Informada
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Con esta guía completa, tu decisión de contratar una agencia
                será significativamente más estratégica, informada y efectiva.
                Podrás evaluar con criterio profesional propuestas de agencias y
                tomar la mejor decisión para tu negocio.
              </p>

              <div className="bg-gradient-to-r from-[#00C5FF]/10 to-[#00FF7C]/10 border-l-4 border-[#00C5FF] p-6 rounded-lg mb-6">
                <p className="text-gray-300 mb-4">
                  Recuerda que contratar una agencia de marketing digital no es
                  un gasto, es una{" "}
                  <strong className="text-white">
                    inversión estratégica en el crecimiento de tu negocio
                  </strong>
                  . La agencia correcta se convertirá en un socio invaluable que
                  entiende tus desafíos, comparte tu visión y trabaja
                  incansablemente para lograr tus objetivos.
                </p>
              </div>

              <p className="text-gray-300 mb-6">
                Tómate el tiempo necesario para hacer las preguntas correctas,
                revisar casos de éxito verificables, y sentir que hay química y
                entendimiento genuino. Una relación cliente-agencia exitosa se
                basa en confianza mutua, comunicación transparente y alineación
                total de objetivos.
              </p>

              <p className="text-gray-300 mb-6">
                No te apresures por urgencia - una decisión bien pensada hoy te
                ahorrará meses de frustración y dinero perdido mañana.
              </p>

              <p className="text-xl text-gray-300">
                El marketing digital profesional tiene el poder de transformar
                completamente la trayectoria de tu negocio, abriendo puertas a
                nuevos mercados, clientes y oportunidades que antes parecían
                inalcanzables.{" "}
                <strong className="text-white">
                  Con la agencia correcta a tu lado, ese crecimiento exponencial
                  no solo es posible, es inevitable.
                </strong>
              </p>
            </section>

            {/* Author Card */}
            <div className="flex items-center gap-4 p-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl mt-16">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] flex items-center justify-center text-black font-bold text-2xl flex-shrink-0">
                CD
              </div>
              <div>
                <h4 className="text-lg font-bold">C Digital Team</h4>
                <p className="text-sm text-gray-400">
                  Marketing Digital y Diseño
                </p>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}
