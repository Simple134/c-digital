// Datos estáticos de la Auditoría Digital Gratuita.
// Extraído del prototipo HTML para mantener page.tsx enfocado en la lógica de UI.

export type Level = "green" | "yellow" | "red";

export interface QuestionOption {
  text: string;
  level: Level;
}

export interface Question {
  text: string;
  opts: QuestionOption[];
}

export interface Rec {
  title: string;
  text: string;
  tags: string[];
}

export interface Area {
  id: string;
  title: string;
  short: string;
  featured?: boolean;
  qs: Question[];
  recs: Record<Level, Rec>;
}

// Iconos Lucide como strings SVG (stroke, sin fill).
// Se inyectan con dangerouslySetInnerHTML tanto en la UI como en el PDF.
export const ICONS: Record<string, string> = {
  posicionamiento: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  ventas: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="8 5 19 5 19 16"/></svg>`,
  tiempo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  autoridad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>`,
  idea: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.1 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  escalar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/><path d="M12 2c0 5.5 4 10 10 10"/><circle cx="12" cy="12" r="3"/><path d="m5 19 3-3"/></svg>`,
  pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
};

export const AREAS: Area[] = [
  {
    id: "posicionamiento",
    title: "Posicionamiento",
    short: "Que te encuentren",
    qs: [
      {
        text: "¿Tu negocio tiene una identidad visual definida (logo, colores, tipografía)?",
        opts: [
          {
            text: "Sí, todo está definido y se usa de forma consistente",
            level: "green",
          },
          {
            text: "Tenemos algo pero no es consistente en todos los canales",
            level: "yellow",
          },
          {
            text: "No, usamos lo que tenemos a mano según el momento",
            level: "red",
          },
        ],
      },
      {
        text: "¿Con qué frecuencia publicas en redes sociales?",
        opts: [
          {
            text: "Varias veces por semana, con un plan editorial",
            level: "green",
          },
          {
            text: "Publicamos cuando podemos o cuando nos recordamos",
            level: "yellow",
          },
          {
            text: "Casi no publicamos o llevamos meses sin hacerlo",
            level: "red",
          },
        ],
      },
      {
        text: "¿El contenido que publicas refleja lo que realmente es tu marca?",
        opts: [
          {
            text: "Sí, cualquiera que nos vea entiende quiénes somos",
            level: "green",
          },
          {
            text: "A veces, pero no siempre se ve como quisiéramos",
            level: "yellow",
          },
          { text: "No, se ve genérico o improvisado", level: "red" },
        ],
      },
      {
        text: "¿Tu negocio aparece en Google cuando alguien te busca?",
        opts: [
          {
            text: "Sí, con información completa y actualizada",
            level: "green",
          },
          {
            text: "Aparece pero la información está incompleta o desactualizada",
            level: "yellow",
          },
          { text: "No aparece o no lo hemos revisado nunca", level: "red" },
        ],
      },
      {
        text: '¿Sientes orgullo de decirle a alguien "síguenos en redes"?',
        opts: [
          {
            text: "Sí, nuestras redes representan bien lo que somos",
            level: "green",
          },
          {
            text: "A veces, pero sé que podría verse mucho mejor",
            level: "yellow",
          },
          { text: "Honestamente no, me da un poco de pena", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Presencia sólida, hora de destacar",
        text: "Tu posicionamiento base está bien trabajado. El siguiente paso es diferenciarte activamente: contenido premium, estrategia editorial avanzada y presencia en IAs como ChatGPT o Perplexity donde tus clientes también buscan.",
        tags: ["Contenido premium", "SEO avanzado", "Presencia en IAs"],
      },
      yellow: {
        title: "Presencia inconsistente, hay que sistematizarla",
        text: "Tienes los ingredientes pero no el sistema. Sin consistencia, tu marca no se acumula en la mente de tus prospectos. Necesitas un plan de contenidos fijo, identidad visual unificada y alguien que ejecute semana a semana.",
        tags: [
          "Plan editorial mensual",
          "Identidad visual",
          "Gestión de redes",
        ],
      },
      red: {
        title: "Presencia crítica, punto de partida inmediato",
        text: "Tu negocio no existe digitalmente para la mayoría de tus clientes potenciales. Esto no es un problema de marketing — es una pérdida activa de oportunidades. El primer paso es construir una base sólida: marca, redes activas y Google bien configurado.",
        tags: [
          "Branding desde cero",
          "Activación de redes",
          "Google My Business",
        ],
      },
    },
  },
  {
    id: "ventas",
    title: "Ventas",
    short: "Que te compren",
    qs: [
      {
        text: "¿De dónde vienen la mayoría de tus clientes nuevos?",
        opts: [
          {
            text: "De estrategias digitales activas: ads, SEO, redes",
            level: "green",
          },
          {
            text: "De referidos o boca a boca principalmente",
            level: "yellow",
          },
          { text: "No sabemos con certeza de dónde vienen", level: "red" },
        ],
      },
      {
        text: "¿Tienes un proceso claro para convertir un interesado en cliente?",
        opts: [
          {
            text: "Sí, tenemos pasos definidos y los seguimos siempre",
            level: "green",
          },
          {
            text: "Más o menos, pero depende de quién atienda",
            level: "yellow",
          },
          { text: "No, cada caso se maneja diferente", level: "red" },
        ],
      },
      {
        text: "¿Has invertido en publicidad pagada (Meta Ads, Google Ads)?",
        opts: [
          {
            text: "Sí, con resultados medibles y consistentes",
            level: "green",
          },
          {
            text: "Lo hemos intentado pero sin resultados claros",
            level: "yellow",
          },
          {
            text: "No hemos invertido nunca en publicidad pagada",
            level: "red",
          },
        ],
      },
      {
        text: "¿Tienes una página web o landing page donde el cliente pueda tomar acción?",
        opts: [
          {
            text: "Sí, está activa, actualizada y genera contactos",
            level: "green",
          },
          {
            text: "Tenemos web pero no genera contactos realmente",
            level: "yellow",
          },
          { text: "No tenemos web o está desactualizada", level: "red" },
        ],
      },
      {
        text: "¿Puedes medir cuántos clientes potenciales llegan cada mes por canales digitales?",
        opts: [
          {
            text: "Sí, tenemos métricas claras y las revisamos",
            level: "green",
          },
          {
            text: "Tenemos algunos datos pero no los revisamos regularmente",
            level: "yellow",
          },
          { text: "No medimos nada actualmente", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Motor activo, escala con inteligencia",
        text: "Ya tienes un motor de ventas digitales funcionando. El siguiente nivel es optimizar: reducir el costo por lead, mejorar la tasa de conversión en cada etapa del embudo y explorar nuevos canales como Google Ads o influencers segmentados.",
        tags: ["Optimización de campañas", "A/B testing", "Nuevos canales"],
      },
      yellow: {
        title: "Potencial sin activar, el sistema no está cerrado",
        text: "Tienes clientes, pero el canal digital no está trabajando para ti. Dependes demasiado del boca a boca, que no escala. Necesitas un embudo de captación activo: anuncio → landing → seguimiento → conversión.",
        tags: ["Embudo de ventas", "Landing page", "Meta Ads"],
      },
      red: {
        title: "Sin sistema de captación, urgente construirlo",
        text: "Sin un canal de adquisición digital activo, tu crecimiento depende del azar. Construir este sistema es la inversión más importante que puedes hacer ahora: una página que convierte + publicidad que lleva tráfico + seguimiento que cierra.",
        tags: [
          "Estrategia digital completa",
          "Publicidad pagada",
          "CTA y conversión",
        ],
      },
    },
  },
  {
    id: "tiempo",
    title: "Tiempo",
    short: "Recuperar tu tiempo",
    qs: [
      {
        text: "¿Cuánto tiempo pasas respondiendo mensajes de clientes manualmente cada día?",
        opts: [
          {
            text: "Poco, tenemos respuestas automáticas o alguien asignado",
            level: "green",
          },
          { text: "Varias horas al día, pero es manejable", level: "yellow" },
          {
            text: "Es una de las cosas que más tiempo me consume",
            level: "red",
          },
        ],
      },
      {
        text: "¿Tienes procesos documentados para las tareas repetitivas de tu negocio?",
        opts: [
          {
            text: "Sí, todo está documentado y el equipo lo sigue",
            level: "green",
          },
          {
            text: "Algunas cosas sí, pero depende mucho de mí",
            level: "yellow",
          },
          { text: "No, todo está en mi cabeza", level: "red" },
        ],
      },
      {
        text: "¿Usas alguna herramienta para gestionar clientes, seguimientos o ventas (CRM)?",
        opts: [
          { text: "Sí, usamos un CRM o sistema organizado", level: "green" },
          {
            text: "Usamos Excel, notas o WhatsApp para organizarnos",
            level: "yellow",
          },
          { text: "No tenemos ningún sistema de gestión", level: "red" },
        ],
      },
      {
        text: "¿Qué pasa en tu negocio cuando tú no estás?",
        opts: [
          { text: "Funciona bien, el equipo sabe qué hacer", level: "green" },
          { text: "Hay algunos problemas pero se resuelven", level: "yellow" },
          { text: "Todo se detiene o se complica seriamente", level: "red" },
        ],
      },
      {
        text: "¿Sientes que el negocio te consume más a ti de lo que tú lo diriges?",
        opts: [
          {
            text: "No, tengo control y tiempo para pensar en crecer",
            level: "green",
          },
          { text: "A veces sí, hay semanas muy pesadas", level: "yellow" },
          { text: "Sí, constantemente estoy apagando fuegos", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Sistema funcionando, hora de escalar sin fricción",
        text: "Tus operaciones están bajo control. El siguiente paso es integrar más inteligencia: dashboards automáticos, reportes sin intervención manual y automatizaciones avanzadas que reduzcan aún más el trabajo repetitivo.",
        tags: [
          "Dashboards automáticos",
          "Integraciones avanzadas",
          "IA en procesos",
        ],
      },
      yellow: {
        title: "Dependencia personal alta, hay que reducirla",
        text: "El negocio funciona, pero demasiado a través de ti. Cada hora que pasas en tareas operativas es una hora que no inviertes en crecer. Automatizar WhatsApp, implementar un CRM y documentar procesos puede devolverte entre 2 y 4 horas diarias.",
        tags: [
          "Automatización WhatsApp",
          "CRM básico",
          "Documentación de procesos",
        ],
      },
      red: {
        title: "Cuello de botella crítico, el crecimiento está bloqueado",
        text: "Eres el cuello de botella de tu propio negocio. Esto no solo afecta tu calidad de vida — limita activamente cuánto puede crecer la empresa. Necesitas un sistema urgente: automatizaciones, CRM y procesos claros antes de intentar escalar.",
        tags: [
          "Automatizaciones urgentes",
          "CRM desde cero",
          "Sistema de gestión",
        ],
      },
    },
  },
  {
    id: "autoridad",
    title: "Autoridad",
    short: "Que se note tu nivel",
    qs: [
      {
        text: "¿Produces contenido que demuestre tu conocimiento (artículos, videos, posts educativos)?",
        opts: [
          {
            text: "Sí, regularmente compartimos contenido de valor",
            level: "green",
          },
          { text: "Ocasionalmente, pero no es consistente", level: "yellow" },
          { text: "No, solo publicamos productos o promociones", level: "red" },
        ],
      },
      {
        text: "¿Tienes reseñas o testimonios visibles de clientes satisfechos?",
        opts: [
          { text: "Sí, muchas reseñas positivas y recientes", level: "green" },
          {
            text: "Tenemos algunas pero pocas y no muy recientes",
            level: "yellow",
          },
          {
            text: "No tenemos reseñas o nunca las hemos gestionado",
            level: "red",
          },
        ],
      },
      {
        text: "¿Cómo te compara un cliente potencial con tu competencia?",
        opts: [
          { text: "Claramente nos diferenciamos y se nota", level: "green" },
          {
            text: "Somos similares, el precio suele ser el factor decisivo",
            level: "yellow",
          },
          {
            text: "No sabemos cómo nos perciben vs la competencia",
            level: "red",
          },
        ],
      },
      {
        text: "¿Tu marca es reconocida como referencia en tu industria o ciudad?",
        opts: [
          { text: "Sí, somos referencia en nuestro sector", level: "green" },
          {
            text: "Nos conocen algunos pero no somos referencia",
            level: "yellow",
          },
          {
            text: "Somos prácticamente desconocidos fuera de nuestros clientes",
            level: "red",
          },
        ],
      },
      {
        text: "¿Comunicas claramente por qué un cliente debería elegirte a ti?",
        opts: [
          {
            text: "Sí, tenemos una propuesta de valor clara y la comunicamos",
            level: "green",
          },
          {
            text: "Sabemos por qué somos buenos pero no lo comunicamos bien",
            level: "yellow",
          },
          { text: "No tenemos claro cómo diferenciarnos", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Autoridad construida, expándela a nuevos canales",
        text: "Tienes credibilidad en tu mercado. El siguiente nivel es expandir esa autoridad a canales donde tu competencia no está: LinkedIn editorial, podcast de nicho, colaboraciones estratégicas o contenido que posicione a tus directivos como referentes.",
        tags: ["LinkedIn editorial", "Thought leadership", "Colaboraciones"],
      },
      yellow: {
        title: "Expertise sin comunicar, hay dinero sobre la mesa",
        text: "Eres bueno en lo que haces, pero tu mercado no lo sabe todavía. Cuando el cliente no puede diferenciarte, elige por precio. La solución es crear contenido que eduque y demuestre: casos de éxito, contenido educativo y reseñas activamente gestionadas.",
        tags: ["Casos de éxito", "Contenido educativo", "Gestión de reseñas"],
      },
      red: {
        title: "Autoridad inexistente, difícil competir así",
        text: "Sin diferenciación percibida, eres uno más. Construir autoridad toma tiempo, pero empieza con pasos concretos: propuesta de valor clara, primeros testimonios activamente solicitados y contenido que demuestre qué sabes hacer.",
        tags: [
          "Propuesta de valor",
          "Primeros testimonios",
          "Branding de autoridad",
        ],
      },
    },
  },
  {
    id: "idea",
    title: "Idea",
    short: "Darle forma a tu idea",
    qs: [
      {
        text: "¿Qué tan definida está tu idea de negocio?",
        opts: [
          {
            text: "Clara: sé qué es, a quién va dirigida y cómo funciona",
            level: "green",
          },
          {
            text: "Tengo el concepto pero faltan detalles importantes",
            level: "yellow",
          },
          {
            text: "Todavía está muy en construcción en mi cabeza",
            level: "red",
          },
        ],
      },
      {
        text: "¿Tu idea tiene identidad visual o nombre definido?",
        opts: [
          {
            text: "Sí, tenemos nombre, logo y estilo visual definidos",
            level: "green",
          },
          { text: "Tenemos nombre pero nada visual todavía", level: "yellow" },
          { text: "No, aún no hemos llegado a eso", level: "red" },
        ],
      },
      {
        text: "¿Has validado si hay personas dispuestas a pagar por lo que ofreces?",
        opts: [
          {
            text: "Sí, ya tenemos clientes o interesados reales",
            level: "green",
          },
          {
            text: "Hemos hablado con algunos pero sin confirmar",
            level: "yellow",
          },
          { text: "No, todavía estamos en fase de idea pura", level: "red" },
        ],
      },
      {
        text: "¿Tienes alguna presencia digital para tu idea (web, redes, landing)?",
        opts: [
          { text: "Sí, ya tenemos presencia activa", level: "green" },
          { text: "Tenemos algo básico pero sin desarrollar", level: "yellow" },
          { text: "No tenemos nada digital todavía", level: "red" },
        ],
      },
      {
        text: "¿Tienes claro el siguiente paso para que tu idea empiece a operar?",
        opts: [
          {
            text: "Sí, tenemos un plan de lanzamiento con fechas",
            level: "green",
          },
          {
            text: "Tenemos una idea general pero sin fechas ni acciones claras",
            level: "yellow",
          },
          { text: "No sabemos por dónde empezar", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Idea sólida, ejecuta con velocidad",
        text: "Tu idea está bien definida y validada. El riesgo ahora es la lentitud: mientras más esperas, más terreno le das a la competencia. Construye tu presencia digital con identidad profesional desde el primer día y activa tu plan de lanzamiento.",
        tags: [
          "Lanzamiento digital",
          "Presencia premium",
          "Activación de mercado",
        ],
      },
      yellow: {
        title: "Idea prometedora, falta estructura",
        text: "Tienes algo con potencial, pero sin estructura clara no puedes avanzar rápido ni convencer a otros. El siguiente paso es definir tu propuesta de valor, darle identidad visual y crear una presencia mínima viable para empezar a validar con usuarios reales.",
        tags: ["Propuesta de valor", "MVP digital", "Identidad visual"],
      },
      red: {
        title: "Idea en estado embrionario, necesita dirección",
        text: "Tienes una semilla, pero todavía no está lista para plantar. Antes de invertir en presencia digital necesitas claridad: qué problema resuelves, para quién, y por qué alguien pagaría por eso. Empezamos con una sesión de definición estratégica.",
        tags: [
          "Sesión estratégica",
          "Definición de negocio",
          "Validación de mercado",
        ],
      },
    },
  },
  {
    id: "escalar",
    title: "Escalar",
    short: "Crecer sin romperte",
    featured: true,
    qs: [
      {
        text: "¿Tu modelo de negocio puede crecer sin que tú trabajes el doble?",
        opts: [
          {
            text: "Sí, tenemos sistemas y equipo que lo permiten",
            level: "green",
          },
          {
            text: "Podría, pero requeriría mucho esfuerzo de mi parte",
            level: "yellow",
          },
          { text: "No, si crece más yo colapso", level: "red" },
        ],
      },
      {
        text: "¿Tienes un equipo que pueda operar sin tu presencia constante?",
        opts: [
          {
            text: "Sí, el equipo es autónomo y está bien estructurado",
            level: "green",
          },
          { text: "Hay equipo pero dependen demasiado de mí", level: "yellow" },
          { text: "Soy prácticamente el único que hace todo", level: "red" },
        ],
      },
      {
        text: "¿Tienes claridad de cuánto estás facturando y cuánto quieres facturar?",
        opts: [
          {
            text: "Sí, tengo metas claras y sé exactamente dónde estoy",
            level: "green",
          },
          {
            text: "Más o menos, pero no lo mido con precisión",
            level: "yellow",
          },
          { text: "No llevo un control claro de mis números", level: "red" },
        ],
      },
      {
        text: "¿Sabes exactamente qué está frenando el crecimiento de tu negocio?",
        opts: [
          {
            text: "Sí, lo tengo identificado y estoy trabajando en ello",
            level: "green",
          },
          {
            text: "Tengo una idea pero no estoy completamente seguro",
            level: "yellow",
          },
          { text: "No lo tengo claro aún", level: "red" },
        ],
      },
      {
        text: "¿Tu infraestructura digital está lista para manejar más volumen de clientes?",
        opts: [
          {
            text: "Sí, podemos manejar más clientes sin problema",
            level: "green",
          },
          {
            text: "Tendría que hacer ajustes importantes para lograrlo",
            level: "yellow",
          },
          { text: "No, con lo que tenemos no podríamos escalar", level: "red" },
        ],
      },
    ],
    recs: {
      green: {
        title: "Listo para escalar, activa el sistema completo",
        text: "Tienes los cimientos. Ahora necesitas el sistema completo: marketing activo que genere demanda predecible, ventas automatizadas que conviertan esa demanda, y tecnología que soporte el volumen sin fricciones. Este es el momento del Aliado Estratégico.",
        tags: ["Sistema integrado", "Aliado Estratégico", "Escala predecible"],
      },
      yellow: {
        title: "Potencial de escala bloqueado, hay que desbloquearlo",
        text: "Quieres crecer pero algo lo está frenando — y probablemente son varias cosas a la vez. Necesitamos un diagnóstico completo para identificar el cuello de botella principal y atacarlo primero antes de activar estrategias de crecimiento.",
        tags: ["Diagnóstico completo", "Priorización", "Quick wins"],
      },
      red: {
        title: "Escalar ahora sería peligroso, primero hay que consolidar",
        text: "Crecer sobre una base inestable solo amplifica los problemas. Antes de escalar necesitas consolidar: procesos claros, números bajo control y al menos un canal de adquisición digital funcionando. Trabajemos en eso primero.",
        tags: ["Consolidación primero", "Base operativa", "Plan por fases"],
      },
    },
  },
];

export const levelLabels: Record<Level, string> = {
  green: "Sólido",
  yellow: "En desarrollo",
  red: "Crítico",
};

export const levelPct: Record<Level, number> = {
  green: 85,
  yellow: 52,
  red: 22,
};
export const levelOrder: Record<Level, number> = {
  red: 0,
  yellow: 1,
  green: 2,
};

// Sectores para el formulario de datos del lead.
export const SECTORS = [
  "Retail / Comercio",
  "Salud y Bienestar",
  "Restaurantes / Gastronomía",
  "Inmobiliario",
  "Servicios profesionales",
  "Educación",
  "Construcción / Ingeniería",
  "Tecnología",
  "Moda / Belleza",
  "Otro",
];

export const WHATSAPP_NUMBER = "17867557025";

// Formatea un número de WhatsApp local (RD/US, 10 dígitos) como 829-819-8789.
// Ignora cualquier caracter no numérico y limita a 10 dígitos.
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

// Utilidad: calcula el nivel global de un área según sus respuestas.
export function calcScore(answers: Record<number, { level: Level }>): Level {
  const counts = { green: 0, yellow: 0, red: 0 };
  Object.values(answers || {}).forEach((v) => counts[v.level]++);
  if (counts.red >= counts.green && counts.red >= counts.yellow) return "red";
  if (counts.yellow >= counts.green) return "yellow";
  return "green";
}
