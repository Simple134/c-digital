"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Background from "@/components/background";
import CtaSection from "@/components/CtaSection";
import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";
import posthog from "posthog-js";

gsap.registerPlugin(ScrollTrigger);

const PORTFOLIO = [
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

const OBJECTIVES = [
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

const LOGOS = [
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

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const WIDGET_ID = process.env.NEXT_PUBLIC_WIDGET_ID ?? "";
  const [activeObj, setActiveObj] = useState(0);

  useGSAP(
    () => {
      // ── Hero entrance: slow, cinematic fade-up ────────────────────────
      const heroTl = gsap.timeline({
        defaults: { ease: "expo.out" },
        delay: 0.2,
      });

      heroTl
        .from(".hero-video", {
          x: 40,
          opacity: 0,
          duration: 1.4,
          ease: "power3.out",
        })
        .from(".hero-tag", { y: 14, opacity: 0, duration: 1.1 }, "-=0.6")
        .from(
          ".hero-h1-line",
          { y: 40, opacity: 0, duration: 1.4, stagger: 0.18 },
          "-=0.6",
        )
        .from(".hero-sub", { y: 18, opacity: 0, duration: 1.2 }, "-=0.8")
        .from(
          ".hero .hero-cta-group",
          { y: 16, opacity: 0, duration: 1.1 },
          "-=0.8",
        )
        .from(".hero-tagline", { y: 12, opacity: 0, duration: 1.0 }, "-=0.8");

      // ── Scroll reveal for all other sections ─────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.to(".portfolio-label-line", {
        scaleX: 1,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: { trigger: ".portfolio-header", start: "top 85%" },
      });

      // ── Section 3 (Portfolio) entrance ───────────────────────────────
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".portfolio",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        })
        .from(".portfolio-label", {
          x: -30,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        })
        .from(
          ".portfolio-title-main",
          {
            y: 40,
            opacity: 0,
            duration: 1.1,
            ease: "power3.out",
          },
          "-=0.5",
        );

      const mm = gsap.matchMedia();

      // ── Section 2 entrance: título izq + personaje der ───────────────
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".why-us",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        })
        .from(".why-us-title", {
          x: -40,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
        })
        .from(
          ".why-progress",
          {
            x: -24,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.7",
        )
        .from(
          ".why-character",
          {
            x: 60,
            opacity: 0,
            duration: 1.3,
            ease: "power3.out",
          },
          "<",
        );

      mm.add("(min-width: 769px)", () => {
        const whyItems = gsap.utils.toArray<HTMLElement>(".why-item");
        const pips = gsap.utils.toArray<HTMLElement>(".why-progress-pip");

        // Size the container to the tallest item so layout doesn't collapse
        const container = document.querySelector<HTMLElement>(".why-items");
        if (container) {
          const maxH = Math.max(...whyItems.map((el) => el.scrollHeight));
          container.style.minHeight = `${maxH}px`;
        }

        const whyTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".why-us",
            pin: true,
            start: "top top",
            end: `+=${whyItems.length * 700}`,
            scrub: 1,
          },
        });

        whyItems.forEach((item, i) => {
          const isLast = i === whyItems.length - 1;
          whyTl
            // Activate dot + fade in item
            .to(
              pips[i],
              {
                backgroundColor: "var(--accent-color)",
                scale: 1.8,
                duration: 0.2,
              },
              "<",
            )
            .to(
              item,
              { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
              "<",
            )
            .to({}, { duration: 0.5 })
            // Deactivate dot + fade out item (skip for last)
            .to(
              pips[i],
              isLast
                ? {}
                : {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    scale: 1,
                    duration: 0.2,
                  },
            )
            .to(
              item,
              isLast
                ? {}
                : { autoAlpha: 0, y: -16, duration: 0.3, ease: "power2.in" },
              "<",
            );
        });
      });

      mm.add("(max-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>(".why-item").forEach((item) => {
          gsap.to(item, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section className="hero">
        {/* Video: absolute, before particles in DOM — particles paint on top */}
        <div className="hero-video">
          <video className="hero-character" autoPlay loop muted playsInline>
            <source src="/Hero C Digital Animation.mp4" type="video/mp4" />
          </video>
        </div>

        <Background />

        <div className="container">
          {/* Columna izquierda: texto */}
          <div className="hero-text">
            {/* Tag label */}
            <p className="hero-tag">
              <span className="hero-tag-dot" />
              Marketing · Automatizaciones · Tecnología
            </p>

            {/* Main heading */}
            <h1>
              <span className="hero-h1-line">Somos una agencia</span>
              <span className="hero-h1-line hero-h1-line--accent">
                <span className="cursive">especializada</span>
              </span>
              <span className="hero-h1-line hero-h1-line--muted">
                en ayudar a Pymes a
              </span>
              <span className="hero-h1-line hero-h1-line--muted">
                <span className="cursive">vender más</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-sub">
              Diseñamos soluciones completas para aumentar ventas, ahorrar
              tiempo, ganar autoridad, desarrollar ideas y digitalizar Negocios
              desde República Dominicana.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <Link href="/contacto" className="cta-btn">
                Agendar auditoría
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
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </Link>
              <Link href="/contacto" className="cta-btn cta-btn--ghost">
                Auto Diagnóstico
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <p className="hero-tagline">La Mejor Agencia de Marketing del Cibao.</p>
      </section>

      {/* Logos */}
      <section className="logos-section">
        <div className="container">
          <p className="pricing-tag reveal-up">Confían en nosotros estas</p>
          <h2 className="reveal-up">Empresas:</h2>
        </div>
        <div className="logos-carousel">
          <div className="logos-track">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <Image
                key={i}
                src={`/logos-empresas/${logo}.svg`}
                alt={logo}
                width={120}
                height={32}
                style={{ height: "58px", width: "auto" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Objectives — 3ª sección */}
      <section className="objectives container">
        <div className="objectives-header reveal-up">
          <p className="pricing-tag">Te identificas con uno de estos...</p>
          <h2>Problemas:</h2>
        </div>

        <div className="objectives-layout">
          {/* Columna izquierda: selectores */}
          <div
            className="objectives-list"
            role="tablist"
            aria-label="Objetivos de negocio"
          >
            {OBJECTIVES.map((obj, i) => (
              <button
                key={obj.slug}
                role="tab"
                aria-selected={activeObj === i}
                aria-controls={`panel-${obj.slug}`}
                id={`tab-${obj.slug}`}
                className={`obj-selector${activeObj === i ? " obj-selector--active" : ""}`}
                onClick={() => setActiveObj(i)}
              >
                <span className="obj-icon">{obj.icon}</span>
                <span className="obj-meta">
                  <span className="obj-title">{obj.title}</span>
                  <span className="obj-tagline">{obj.tagline}</span>
                </span>
                {"badge" in obj && obj.badge && (
                  <span className="obj-badge">{obj.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Columna derecha: panel de detalle */}
          <div
            className="objectives-panel"
            role="tabpanel"
            id={`panel-${OBJECTIVES[activeObj].slug}`}
            aria-labelledby={`tab-${OBJECTIVES[activeObj].slug}`}
          >
            <div className="panel-content" key={activeObj}>
              <p className="panel-question">
                &ldquo;{OBJECTIVES[activeObj].question}&rdquo;
              </p>

              <div className="panel-block">
                <span className="panel-block-label">
                  Soluciones al problema:
                </span>
                <p className="panel-block-text">
                  {OBJECTIVES[activeObj].tenemos}
                </p>
              </div>

              <div className="panel-block">
                <span className="panel-block-label">Te garantizamos</span>
                <p className="panel-block-text">
                  {OBJECTIVES[activeObj].garantia}
                </p>
              </div>

              <Link
                href={`/contacto?objetivo=${OBJECTIVES[activeObj].slug}`}
                className="cta-btn"
              >
                {OBJECTIVES[activeObj].cta}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="portfolio container">
        <div className="portfolio-header">
          <span className="portfolio-label">Casos de éxito</span>
          <div className="portfolio-label-line" />
        </div>
        <h2 className="portfolio-title-main">Recientes</h2>
        <div className="portfolio-grid">
          {PORTFOLIO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`portfolio-item ${item.cls} reveal-up`}
              onClick={() =>
                posthog.capture("portfolio_item_clicked", {
                  title: item.title,
                  category: item.category,
                  href: item.href,
                })
              }
            >
              <Image
                src={item.img}
                alt={item.title}
                width={800}
                height={600}
                style={{ width: "100%", height: "auto" }}
              />
              <div className="portfolio-info">
                <div className="portfolio-meta-row">
                  <p className="portfolio-category">{item.category}</p>
                  <div className="portfolio-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="portfolio-tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="portfolio-title">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="testimonials container">
        <div className="testimonials-header reveal-up">
          <p className="pricing-tag">Testimonios</p>
          <h2 className="reveal-up">De empresas</h2>
        </div>
        <ReactGoogleReviews
          carouselBtnStyle={{ display: "none" }}
          layout="carousel"
          maxItems={3}
          carouselAutoplay={true}
          carouselSpeed={1500}
          showDots={false}
          featurableId={WIDGET_ID}
        />
      </section>

      {/* Why Us — después de testimonios */}
      <section className="why-us">
        <div className="why-us-inner">
          {/* Columna izquierda: título + dots + preguntas */}
          <div className="why-us-text">
            <h2 className="why-us-title">
              Seguro te has
              <br />
              preguntado esto...
            </h2>
            {(() => {
              const questions = [
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
              return (
                <>
                  <div className="why-progress" aria-hidden="true">
                    {questions.map((w) => (
                      <span key={w.num} className="why-progress-pip" />
                    ))}
                  </div>
                  <div className="why-items">
                    {questions.map((w) => (
                      <div key={w.num} className="why-item">
                        <span className="why-num">{w.num}</span>
                        <p className="why-question">{w.q}</p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="hero-cta-group why-us-cta">
              <Link href="/contacto" className="cta-btn">
                Agendar auditoría
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
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </Link>
              <Link href="/contacto" className="cta-btn cta-btn--ghost">
                Auto Diagnóstico
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Columna derecha: imagen personaje */}
          <div className="why-us-video">
            <Image
              src="/personaje-seccion2.png"
              alt="Personaje C Digital"
              width={600}
              height={800}
              className="why-character"
              priority
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title="¿No sabes por dónde iniciar?"
        text="La solución para tu incertidumbre es una auditoría gratis. No procrastines más y agenda sin compromiso."
      />
    </div>
  );
}
