import type { ReactNode } from "react";

// Datos estáticos de la página de inicio (src/app/page.tsx).
// Se extraen aquí para mantener el componente enfocado en la UI y las
// animaciones. Este archivo es .tsx porque los iconos de OBJECTIVES son JSX.

export interface PortfolioItem {
  href: string;
  img: string;
  category: string;
  title: string;
  cls: string;
  tags: string[];
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    href: "/trabajos/branding",
    img: "/proyectos/portada-branding.jpg",
    category: "Branding / Identity",
    title: "OSY Excavator",
    cls: "item-1",
    tags: ["Autoridad"],
  },
  {
    href: "/trabajos/web",
    img: "/proyectos/portada-web.jpg",
    category: "Web Design / UX",
    title: "Gestiono Marketplace",
    cls: "item-2",
    tags: ["Idea"],
  },
  {
    href: "/trabajos/app",
    img: "/proyectos/portada-app.jpg",
    category: "Mobile App / UI",
    title: "Brigada de Rescate",
    cls: "item-3",
    tags: ["Idea", "Tiempo"],
  },
  {
    href: "/trabajos/rebranding",
    img: "/proyectos/portada-rebranding.jpg",
    category: "Rebranding",
    title: "Alas de Larimar",
    cls: "item-4",
    tags: ["Tiempo", "Ventas"],
  },
  {
    href: "/trabajos/seo",
    img: "/proyectos/portada-seo.jpg",
    category: "SEO / Marketing Digital",
    title: "Posicionamiento SEO",
    cls: "item-5",
    tags: ["Posicionamiento"],
  },
];

export interface Objective {
  slug: string;
  title: string;
  tagline: string;
  badge?: string;
  icon: ReactNode;
  question: string;
  tenemos: string;
  garantia: string;
  cta: string;
}

export const OBJECTIVES: Objective[] = [
  {
    slug: "posicionamiento",
    title: "Posicionamiento",
    tagline: "Que te encuentren",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M2.05 12a9.95 9.95 0 1 0 19.9 0 9.95 9.95 0 0 0-19.9 0" />
        <path d="M12 2v2M12 20v2M2 12H4M20 12h2" />
      </svg>
    ),
    question:
      "¿Sientes que nadie sabe todo lo que realmente haces, o que tu competencia se ve más profesional aunque tu trabajo es mejor?",
    tenemos:
      "Gestión de redes, contenido con identidad propia, SEO local y Google My Business optimizado.",
    garantia:
      "Presencia constante y profesional: que cuando te busquen, te encuentren bien.",
    cta: "Quiero que me ayuden con posicionamiento",
  },
  {
    slug: "ventas",
    title: "Ventas",
    tagline: "Que te compren",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    question:
      "¿Tienes presencia, pero no se está traduciendo en clientes nuevos?",
    tenemos:
      "Publicidad en Meta y Google Ads, landing pages, embudos de conversión y automatizaciones de WhatsApp.",
    garantia:
      "Un flujo medible de leads o solicitudes: resultados que puedes contar, no solo likes.",
    cta: "Quiero que me ayuden con ventas",
  },
  {
    slug: "tiempo",
    title: "Tiempo",
    tagline: "Recuperar tu tiempo",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    question:
      "¿Sientes que trabajas más en tu negocio que para tu negocio: respondiendo, organizando, repitiendo lo mismo cada día?",
    tenemos:
      "Automatizaciones de WhatsApp, CRM, sistemas o apps a tu medida y reportes automáticos.",
    garantia:
      "Procesos que funcionan sin que tú estés encima: más horas para lo que importa.",
    cta: "Quiero que me ayuden a ganar tiempo",
  },
  {
    slug: "autoridad",
    title: "Autoridad",
    tagline: "Que se note tu nivel",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    question:
      "¿Sabes que eres bueno en lo que haces, pero sientes que no se nota cuando alguien te busca o te compara?",
    tenemos:
      "Contenido educativo y de valor, branding premium, casos de éxito y presencia editorial.",
    garantia: "Que tu experiencia se vea reflejada, no solo que la digas.",
    cta: "Quiero trabajar mi autoridad",
  },
  {
    slug: "idea",
    title: "Idea",
    tagline: "Darle forma a tu idea",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6M10 22h4" />
      </svg>
    ),
    question:
      "¿Tienes una idea de negocio o proyecto, pero no sabes por dónde empezar a darle forma?",
    tenemos:
      "Branding desde cero, identidad visual, landing o web de lanzamiento y definición de propuesta de valor.",
    garantia:
      "Que tu idea salga al mundo con una imagen sólida desde el primer día.",
    cta: "Quiero desarrollar mi idea",
  },
  {
    slug: "escalar",
    title: "Escalar",
    tagline: "Crecer sin romperte",
    badge: "Sistema completo",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m3.5 11.5 1 4.5 4.5 1L21 4l-6.5-1.5-11 9z" />
        <path d="m13.5 6.5-3 3M16.5 9.5l-3 3" />
      </svg>
    ),
    question:
      "¿Te identificas con varios de estos a la vez, y sientes que tu negocio está topado para crecer más?",
    tenemos:
      "Combinación de los pilares anteriores, más CRM, automatización y un equipo dedicado a tu negocio.",
    garantia:
      "Un sistema que crece con tu negocio, sin que tú seas el cuello de botella.",
    cta: "Quiero el sistema completo",
  },
];

export const LOGOS: string[] = [
  "Cafelogo",
  "Dubiel",
  "Eddward",
  "Elainne",
  "Espuma del Caribe",
  "Fenix care",
  "Gotransfer",
  "HG",
  "HR",
  "Innacorp",
  "Linkup",
  "Merk2",
  "Murcia",
  "Nenox",
  "Nutriopcion",
  "Omelefit",
  "RC Motoprestamos",
  "TheBillis",
  "Thunder",
  "Urbano",
  "Yerdoza",
  "ZR Logo",
];

export interface WhyQuestion {
  num: string;
  q: string;
}

export const WHY_QUESTIONS: WhyQuestion[] = [
  {
    num: "01",
    q: "¿Mi negocio podría crecer más si tuviera más tiempo para enfocarme en vender?",
  },
  {
    num: "02",
    q: "¿Estoy haciendo demasiadas cosas yo solo y eso me está frenando?",
  },
  {
    num: "03",
    q: "¿Tengo clientes, pero siento que estoy perdiendo oportunidades de venta?",
  },
  {
    num: "04",
    q: "¿Mi negocio necesita verse más profesional en internet?",
  },
  {
    num: "05",
    q: "¿Quiero vender más, pero no sé por dónde empezar?",
  },
  {
    num: "06",
    q: "¿Estoy cansado de depender solo del boca a boca para conseguir clientes?",
  },
  {
    num: "07",
    q: "¿Mi empresa necesita digitalizarse, pero no tengo el tiempo ni el equipo para hacerlo?",
  },
  {
    num: "08",
    q: "¿Sé realmente cuáles publicaciones, campañas o anuncios están generando ventas para mi negocio?",
  },
];
