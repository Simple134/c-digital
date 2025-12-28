"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Comotrabajamos from "@/components/Comotrabajamos";

const conectaServices = [
    {
        id: 1,
        slug: "auditoria-digital",
        title: "Auditoría Digital Completa",
        description: "Análisis exhaustivo de tu presencia digital actual para identificar oportunidades de mejora. Evaluamos tu sitio web, redes sociales, SEO, competencia y rendimiento online para crear un diagnóstico detallado con recomendaciones accionables.",
        purpose: "Te permite conocer exactamente dónde estás parado digitalmente, qué está funcionando, qué no, y cuál es el camino más efectivo para alcanzar tus objetivos de negocio."
    },
    {
        id: 2,
        slug: "marketing-digital",
        title: "Estrategia de Marketing Digital",
        description: "Desarrollo de un plan personalizado que define objetivos, audiencias, canales y tácticas específicas para tu negocio. Creamos una hoja de ruta clara con acciones concretas, cronograma y métricas de éxito.",
        purpose: "Evita que inviertas tiempo y dinero en acciones dispersas sin resultados. Te da dirección clara y enfoque estratégico para maximizar tu retorno de inversión en marketing digital."
    },
    {
        id: 3,
        slug: "seo-local",
        title: "Posicionamiento SEO Local",
        description: "Optimización para que tu negocio aparezca en los primeros resultados cuando clientes cercanos buscan tus servicios en Google. Incluye Google Business Profile, palabras clave locales y estrategias geográficas.",
        purpose: "Atrae clientes de tu zona que están buscando activamente lo que ofreces, aumentando visitas presenciales, llamadas y conversiones de clientes locales."
    },
    {
        id: 4,
        slug: "consultoria-estrategica",
        title: "Consultoría Estratégica",
        description: "Asesoramiento experto continuo para tomar decisiones digitales acertadas. Sesiones periódicas donde analizamos resultados, resolvemos desafíos y ajustamos estrategias según la evolución de tu negocio.",
        purpose: "Tienes un experto digital a tu lado sin necesidad de contratar personal interno, ahorrando costos mientras recibes orientación profesional para cada decisión importante."
    },
];

const creaServices = [
    {
        id: 1,
        slug: "branding",
        title: "Diseño de Marca Profesional",
        description: "Creación de identidad visual completa: logo, paleta de colores, tipografías, manual de marca y aplicaciones. Desarrollamos una imagen coherente que refleja los valores y personalidad de tu negocio.",
        purpose: "Transmite profesionalismo y credibilidad, diferenciándote de la competencia. Una marca sólida genera confianza y hace que los clientes te recuerden y prefieran."
    },
    {
        id: 2,
        slug: "desarrollo-web",
        title: "Desarrollo Web y Sistemas",
        description: "Construcción de sitios web modernos, rápidos y responsivos, más sistemas personalizados según tus necesidades. Incluye diseño, programación, optimización y funcionalidades específicas para tu industria.",
        purpose: "Tu sitio web es tu vendedor 24/7. Un desarrollo profesional convierte visitantes en clientes, facilita procesos internos y proyecta una imagen de confianza que impulsa las ventas."
    },
    {
        id: 3,
        slug: "redes-sociales",
        title: "Presencia en Redes Sociales",
        description: "Configuración y optimización de perfiles profesionales en las plataformas relevantes para tu audiencia. Establecemos bases sólidas con imágenes, descripciones, enlaces y estructura adecuada.",
        purpose: "Crea tu punto de contacto con clientes potenciales donde ellos pasan tiempo. Una presencia profesional genera credibilidad y abre canales directos de comunicación con tu mercado."
    },
    {
        id: 4,
        slug: "contenido-visual",
        title: "Contenido Visual",
        description: "Producción de fotografías, videos, gráficos e infografías profesionales para tus canales digitales. Contenido visual atractivo y alineado con tu marca que comunica efectivamente tu mensaje.",
        purpose: "El contenido visual genera 94% más vistas que el texto solo. Captura atención, explica tus servicios rápidamente y aumenta significativamente el engagement y las conversiones."
    },
    {
        id: 5,
        slug: "ecommerce",
        title: "E-commerce (Tienda Online)",
        description: "Desarrollo de plataforma de ventas online completa con catálogo, carrito de compras, pasarelas de pago seguras y gestión de inventario. Soluciones escalables para vender productos o servicios por internet.",
        purpose: "Expande tu negocio más allá de límites físicos, vende 24/7 sin estar presente y accede a nuevos mercados. Aumenta ingresos con un canal de ventas automatizado y medible."
    },
    {
        id: 6,
        slug: "diseño-de-aplicaciones",
        title: "Diseño de Aplicaciones",
        description: "Creación de aplicaciones móviles o web personalizadas para iOS y Android que resuelven necesidades específicas de tu negocio o clientes. Interfaces intuitivas con funcionalidades adaptadas a tus procesos.",
        purpose: "Mejora la experiencia de tus clientes, automatiza procesos, aumenta la fidelización y diferénciate con tecnología propia que facilita la interacción con tu marca."
    },
];

const creceServices = [
    {
        id: 1,
        slug: "gestion-redes",
        title: "Gestión de Redes Sociales",
        description: "Administración completa de tus perfiles: creación de contenido, publicación programada, respuesta a mensajes, monitoreo y reportes. Mantenemos tus redes activas y profesionales.",
        purpose: "Mantén conexión constante con tu audiencia sin consumir tu tiempo. Construye comunidad, genera confianza y convierte seguidores en clientes mientras tú te enfocas en tu negocio."
    },
    {
        id: 2,
        slug: "publicidad-digital",
        title: "Publicidad Digital (Google Ads + Meta Ads)",
        description: "Campañas publicitarias pagadas en Google, Facebook e Instagram optimizadas para generar resultados específicos. Incluye diseño de anuncios, segmentación precisa, gestión de presupuesto y optimización continua.",
        purpose: "Genera resultados inmediatos llevando tu mensaje directamente a clientes potenciales que buscan o necesitan tus servicios. Maximiza cada peso invertido con campañas medibles y ajustables en tiempo real."
    },
    {
        id: 3,
        slug: "posicionamiento-seo",
        title: "Posicionamiento SEO Continuo",
        description: "Optimización constante de tu sitio web para mejorar y mantener rankings en buscadores. Trabajo mensual en contenido, enlaces, aspectos técnicos y estrategias según algoritmos actualizados.",
        purpose: "El SEO no es trabajo de una sola vez. Este servicio garantiza que mantengas y mejores tu visibilidad orgánica, generando tráfico calificado constante sin pagar por cada clic."
    },
    {
        id: 4,
        slug: "email-marketing",
        title: "Email Marketing Automatizado",
        description: "Creación de campañas de correo electrónico segmentadas con secuencias automatizadas según comportamiento del usuario. Incluye diseño, copywriting y análisis de resultados.",
        purpose: "Nutre relaciones con clientes actuales y potenciales de forma automatizada. Recupera ventas abandonadas, fideliza clientes y genera ingresos recurrentes con el canal de mayor ROI del marketing digital."
    },
    {
        id: 5,
        slug: "analitica",
        title: "Analítica y Optimización",
        description: "Implementación de herramientas de medición, análisis profundo de datos y optimización basada en resultados reales. Reportes claros con insights accionables y recomendaciones de mejora.",
        purpose: "Deja de adivinar y toma decisiones basadas en datos. Identifica qué funciona, qué no y dónde invertir para mejorar continuamente tus resultados digitales y maximizar tu inversión."
    },
    {
        id: 6,
        slug: "produccion-contenido",
        title: "Producción de Contenido",
        description: "Creación de contenido de valor: artículos de blog, ebooks, guías, videos educativos y materiales que posicionan tu marca como referente. Contenido optimizado para SEO y conversión.",
        purpose: "Atrae clientes potenciales educándolos, construye autoridad en tu industria y alimenta tus canales digitales con material que genera tráfico orgánico, engagement y conversiones a largo plazo."
    },
];

const Servicios = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeConecta, setActiveConecta] = useState(0);
    const [activeCrea, setActiveCrea] = useState(0);
    const [activeCrece, setActiveCrece] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash.substring(1);
            if (!hash) return;

            const findService = (services: any[], category: string) => {
                return services.find(s => s.slug === hash);
            };

            const conecta = findService(conectaServices, 'conecta');
            const crea = findService(creaServices, 'crea');
            const crece = findService(creceServices, 'crece');

            if (conecta) {
                setActiveConecta(conecta.id);
                setTimeout(() => {
                    const el = document.getElementById(conecta.slug);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else if (crea) {
                setActiveCrea(crea.id);
                setTimeout(() => {
                    const el = document.getElementById(crea.slug);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else if (crece) {
                setActiveCrece(crece.id);
                setTimeout(() => {
                    const el = document.getElementById(crece.slug);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        };

        handleHash();
        const onHashChange = () => handleHash();
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Combine all services for search
    const allServices = [
        ...conectaServices.map(s => ({ ...s, category: 'conecta' })),
        ...creaServices.map(s => ({ ...s, category: 'crea' })),
        ...creceServices.map(s => ({ ...s, category: 'crece' }))
    ];

    // Filter services based on search query
    const filteredSuggestions = searchQuery.trim()
        ? allServices.filter(service =>
            service.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5) // Limit to 5 suggestions
        : [];

    // Handle service selection from search
    const handleServiceSelect = (service: { category: string; id: number, slug: string }) => {
        setSearchQuery("");
        setShowSuggestions(false);

        // Scroll to the service
        const serviceElement = document.getElementById(service.slug);
        if (serviceElement) {
            serviceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Set the appropriate active state
        if (service.category === 'conecta') {
            setActiveConecta(service.id);
        } else if (service.category === 'crea') {
            setActiveCrea(service.id);
        } else if (service.category === 'crece') {
            setActiveCrece(service.id);
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowSuggestions(value.trim().length > 0);
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && filteredSuggestions.length > 0) {
            handleServiceSelect(filteredSuggestions[0]);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-black text-white px-6 md:px-12 lg:px-24 py-12">
            {/* Search Bar */}
            <div className="mb-16">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#01aaa8] w-5 h-5 z-10" />
                    <input
                        type="text"
                        placeholder="Search Services"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full bg-transparent border border-[#333333] rounded-md py-3 pl-12 pr-4 text-white placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#666666] transition-colors"
                    />

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-[#0a0a0a] border border-[#333333] rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                            {filteredSuggestions.map((service) => (
                                <div
                                    key={`${service.category}-${service.id}`}
                                    onClick={() => handleServiceSelect(service)}
                                    className="px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#222222] last:border-b-0 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-['Poppins']">{service.title}</span>
                                        <span className="text-xs text-[#01aaa8] capitalize">{service.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Left Side - Main Content */}
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-['Poppins']">
                        Conecta
                    </h1>

                    <p className="text-[#AFAFAF] text-base md:text-lg leading-relaxed max-w-xl">
                        Todo comienza cuando sientes que tu negocio “está en internet” pero no sabes si realmente está funcionando. En esta etapa te ayudamos a entender dónde estás parado digitalmente y a poner orden para que cada esfuerzo tenga una dirección clara.
                        Aquí trabajamos contigo en: auditoría digital, estrategia de marketing, posicionamiento local y consultoría, para que tengas un plan concreto y dejes de tomar decisiones a ciegas.</p>

                    <div className="pt-4">
                        <button className="bg-transparent border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-300 font-['Poppins'] font-medium">
                            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text flex items-center justify-center w-fit">
                                Necesito esto <span className="text-white ml-2">+</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Right Side - Services List */}
                <div className="flex flex-col justify-center space-y-0">
                    {conectaServices.map((service) => (
                        <div
                            key={service.id}
                            id={service.slug}
                            className={`border-b border-[#333333] transition-all duration-300`}
                        >
                            <div
                                className="flex justify-between items-center py-6 cursor-pointer group"
                                onClick={() => setActiveConecta(activeConecta === service.id ? 0 : service.id)}
                            >
                                <span
                                    className={`text-lg md:text-xl font-['Poppins'] transition-colors duration-300 ${activeConecta === service.id
                                        ? "text-white"
                                        : "text-[#AFAFAF] group-hover:text-white"
                                        }`}
                                >
                                    {service.title}
                                </span>
                                <button className="text-2xl text-white">
                                    {activeConecta === service.id ? "−" : "+"}
                                </button>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${activeConecta === service.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="pb-6">
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed">
                                        {service.description} ¿Para qué sirve?
                                    </p>
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed mt-4">
                                        {service.purpose}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-24 border-b border-[#333333]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mt-12">
                {/* Left Side - Main Content */}
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-['Poppins']">
                        Crea
                    </h1>

                    <p className="text-[#AFAFAF] text-base md:text-lg leading-relaxed max-w-xl">
                        Si ya tienes claro a quién quieres llegar, el siguiente paso es construir una presencia que se vea y se sienta profesional. En esta etapa diseñamos tu marca, sitio web, contenidos y sistemas para que todo lo que el cliente ve de tu negocio inspire confianza.
                        Creamos contigo los activos digitales que te representan: identidad de marca, página web, tienda online, redes listas para vender, contenido visual y hasta aplicaciones si tu negocio lo necesita.
                    </p>
                    <div className="pt-4">
                        <button className="bg-transparent border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-300 font-['Poppins'] font-medium">
                            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text flex items-center justify-center w-fit">
                                Necesito esto <span className="text-white ml-2">+</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Right Side - Services List */}
                <div className="flex flex-col justify-center space-y-0">
                    {creaServices.map((service) => (
                        <div
                            key={service.id}
                            id={service.slug}
                            className={`border-b border-[#333333] transition-all duration-300`}
                        >
                            <div
                                className="flex justify-between items-center py-6 cursor-pointer group"
                                onClick={() => setActiveCrea(activeCrea === service.id ? 0 : service.id)}
                            >
                                <span
                                    className={`text-lg md:text-xl font-['Poppins'] transition-colors duration-300 ${activeCrea === service.id
                                        ? "text-white"
                                        : "text-[#AFAFAF] group-hover:text-white"
                                        }`}
                                >
                                    {service.title}
                                </span>
                                <button className="text-2xl text-white">
                                    {activeCrea === service.id ? "−" : "+"}
                                </button>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCrea === service.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="pb-6">
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed">
                                        {service.description} ¿Para qué sirve?
                                    </p>
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed">
                                        {service.purpose}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-24 border-b border-[#333333]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mt-12">
                {/* Left Side - Main Content */}
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-['Poppins']">
                        Crece
                    </h1>

                    <p className="text-[#AFAFAF] text-base md:text-lg leading-relaxed max-w-xl">
                        Cuando ya estás presente en digital, el reto es que las visitas se conviertan en clientes de forma constante. En esta etapa activamos y optimizamos campañas, contenidos y medición para que tu negocio crezca con resultados medibles.
                        Aquí te acompañamos con gestión de redes, publicidad, SEO continuo, email marketing, analítica y contenido de valor para que dejes de depender del “boca a boca” y tengas un flujo estable de oportunidades.
                    </p>

                    <div className="pt-4">
                        <button className="bg-transparent border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-300 font-['Poppins'] font-medium">
                            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text flex items-center justify-center w-fit">
                                Necesito esto <span className="text-white ml-2"> + </span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Right Side - Services List */}
                <div className="flex flex-col justify-center space-y-0">
                    {creceServices.map((service) => (
                        <div
                            key={service.id}
                            id={service.slug}
                            className={`border-b border-[#333333] transition-all duration-300`}
                        >
                            <div
                                className="flex justify-between items-center py-6 cursor-pointer group"
                                onClick={() => setActiveCrece(activeCrece === service.id ? 0 : service.id)}
                            >
                                <span
                                    className={`text-lg md:text-xl font-['Poppins'] transition-colors duration-300 ${activeCrece === service.id
                                        ? "text-white"
                                        : "text-[#AFAFAF] group-hover:text-white"
                                        }`}
                                >
                                    {service.title}
                                </span>
                                <button className="text-2xl text-white">
                                    {activeCrece === service.id ? "−" : "+"}
                                </button>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCrece === service.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="pb-6">
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed">
                                        {service.description} ¿Para qué sirve?
                                    </p>
                                    <p className="text-[#AFAFAF] text-sm md:text-base leading-relaxed mt-4">
                                        {service.purpose}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-24 border-b border-[#333333]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 mt-12">
                <img src="/ilustration.png" alt="Mujer digital" />
                <div className="flex flex-col justify-center space-y-6 mt-12 md:mt-0 md:ml-12">
                    <h2 className="text-6xl font-bold font-['Poppins'] w-48">
                        Encontraste lo que buscabas?
                    </h2>
                    <button className="bg-transparent border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-all w-fit duration-300 font-['Poppins'] font-medium">
                        <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text flex items-center justify-center">
                            No, necesito asistencia
                        </span>
                    </button>
                </div>
            </div>
            <div className="h-36" />
            <Comotrabajamos />
        </div>
    );
};

export default Servicios;
