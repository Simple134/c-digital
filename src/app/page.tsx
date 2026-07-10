"use client";
import { useRef, useState, useEffect } from "react";
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
import { getPlans, getPortfolio } from "@/lib/content";
import { revealPending } from "@/lib/reveal";

gsap.registerPlugin(ScrollTrigger);

type PlanView = {
  name: string;
  slug: string;
  usd: string;
  period?: string;
  dop: string;
  featured?: boolean;
  features: string[];
  team: string;
  limit?: string;
};

const PORTFOLIO_DEFAULT = [
  {
    href: "/trabajos/branding",
    img: "/proyectos/portada-branding.jpg",
    category: "Branding / Identity",
    title: "OSY Excavator",
    cls: "item-1",
  },
  {
    href: "/trabajos/web",
    img: "/proyectos/portada-web.jpg",
    category: "Web Design / UX",
    title: "Gestiono Marketplace",
    cls: "item-2",
  },
  {
    href: "/trabajos/app",
    img: "/proyectos/portada-app.jpg",
    category: "Mobile App / UI",
    title: "Brigada de Rescate",
    cls: "item-3",
  },
  {
    href: "/trabajos/rebranding",
    img: "/proyectos/portada-rebranding.jpg",
    category: "Rebranding",
    title: "Alas de Larimar",
    cls: "item-4",
  },
  {
    href: "/trabajos/seo",
    img: "/proyectos/portada-seo.jpg",
    category: "SEO / Marketing Digital",
    title: "Posicionamiento SEO",
    cls: "item-5",
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

const PLANS_DEFAULT = [
  {
    name: "Aliado Esencial",
    usd: "$450",
    period: "/mes",
    dop: "RD$26,000",
    slug: "esencial",
    features: [
      "Estrategia de contenido mensual",
      "Gestión de 2 redes sociales",
      "Producción de contenido estático y motion",
      "Google My Business optimizado y posicionado en IAs",
      "Reporte mensual",
    ],
    team: "Carlos · Rachel · Vladimir",
  },
  {
    name: "Aliado Activo",
    usd: "$1,100",
    period: "/mes",
    dop: "RD$64,000",
    slug: "activo",
    featured: true,
    features: [
      "Estrategia de contenido personalizada",
      "Gestión de 3 redes sociales",
      "Producción audiovisual (reels y videos cortos)",
      "Fotografía mensual",
      "Presupuesto para influencer",
      "SEO local + posicionamiento en Google e IAs",
      "Automatizaciones de WhatsApp",
      "Sesión estratégica mensual + reporte avanzado",
    ],
    team: "Equipo completo",
  },
  {
    name: "Aliado Estratégico",
    usd: "A medida",
    dop: "Según diagnóstico",
    slug: "estrategico",
    features: [
      "Ecosistema digital completo",
      "Google Ads",
      "Desarrollo de sistema o app",
      "CRM integrado",
      "Reuniones quincenales",
      "Cualquier combinación de servicios anteriores",
    ],
    team: "Equipo completo · incl. Programador",
    limit: "Máx. 5 clientes en este nivel",
  },
];

const HERO_WORDS = ["Estudio", "Agencia", "Equipo", "Expertos"];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const WIDGET_ID = process.env.NEXT_PUBLIC_WIDGET_ID ?? "";

  // Contenido editable desde el panel (con respaldo a los valores por defecto).
  const [portfolio, setPortfolio] = useState(PORTFOLIO_DEFAULT);
  const [plans, setPlans] = useState<PlanView[]>(PLANS_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dbPortfolio, dbPlans] = await Promise.all([
        getPortfolio(),
        getPlans(),
      ]);
      if (cancelled) return;
      if (dbPortfolio) setPortfolio(dbPortfolio);
      if (dbPlans) setPlans(dbPlans);
      // Revela cualquier ítem nuevo que llegue tras el montaje.
      requestAnimationFrame(() => revealPending(containerRef.current));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useGSAP(
    () => {
      gsap.from(".letter", {
        x: "-110%",
        opacity: 0,
        stagger: 0.05,
        duration: 1,
        ease: "power4.out",
        delay: 0.3,
      });

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

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        const whyItems = gsap.utils.toArray<HTMLElement>(".why-item");
        const whyTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".why-us",
            pin: true,
            start: "top top",
            end: `+=${whyItems.length * 500}`,
            scrub: 0.8,
          },
        });
        whyItems.forEach((item) => {
          whyTl
            .to(item, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
            .to({}, { duration: 0.3 });
        });
      });

      mm.add("(max-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>(".why-item").forEach((item) => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: containerRef },
  );

  const isMounted = useRef(false);

  // Ciclar la palabra cada 2.5 s: animar salida → cambiar índice
  useEffect(() => {
    const interval = setInterval(() => {
      if (!wordRef.current) return;
      const letters = wordRef.current.querySelectorAll<HTMLElement>(".letter");
      gsap.to(letters, {
        x: "110%",
        opacity: 0,
        stagger: 0.03,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () =>
          setWordIndex((prev) => (prev + 1) % HERO_WORDS.length),
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Animar entrada de las letras nuevas tras cada cambio de índice
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!wordRef.current) return;
    const letters = wordRef.current.querySelectorAll<HTMLElement>(".letter");
    gsap.fromTo(
      letters,
      { x: "-110%", opacity: 0 },
      { x: "0%", opacity: 1, stagger: 0.05, duration: 0.6, ease: "power4.out" },
    );
  }, [wordIndex]);

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section className="hero">
        <Background />
        <div className="container">
          <h1>
            <span className="rotating-text-wrapper">
              <span className="rotating-word" ref={wordRef}>
                {HERO_WORDS[wordIndex].split("").map((letter, i) => (
                  <span key={i} className="letter">
                    {letter}
                  </span>
                ))}
              </span>
            </span>
            Digital
          </h1>
          <div className="hero-subtitle">
            <div className="line" />
            <p>AGENCIA DE DESARROLLO DIGITAL PARA PYMES.</p>
          </div>
        </div>
        <p className="hero-tagline">
          Somos el equipo de desarrollo digital que necesita tu negocio para
          crecer.
        </p>
      </section>

      {/* Portfolio */}
      <section className="portfolio container">
        <div className="portfolio-header">
          <span className="portfolio-label">Trabajos</span>
          <div className="portfolio-label-line" />
        </div>
        <h2 className="portfolio-title-main reveal-up">Recientes</h2>
        <div className="portfolio-grid">
          {portfolio.map((item) => (
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
                <p className="portfolio-category">{item.category}</p>
                <h3 className="portfolio-title">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="why-us">
        <Background id="tsparticles-why" />
        <div className="why-us-inner">
          <div>
            <span className="why-us-tag">¿Por qué elegirnos?</span>
            <div className="why-items">
              {[
                {
                  num: "01",
                  title: "Resultados medibles, no promesas.",
                  body: "Cada proyecto que entregamos incluye métricas claras de rendimiento. No trabajamos por intuición: definimos KPIs desde el primer día y los usamos para tomar decisiones.",
                },
                {
                  num: "02",
                  title: "Equipo pequeño, atención real.",
                  body: "No somos una agencia masiva donde tu proyecto se pierde entre cientos. Trabajamos con pocos clientes a la vez para dedicarle el tiempo y la energía que tu negocio merece.",
                },
                {
                  num: "03",
                  title: "Tecnología adaptada a tu escala.",
                  body: "No te vendemos herramientas que no necesitas. Seleccionamos la tecnología justa para tu momento actual, con capacidad de crecer contigo sin deuda técnica innecesaria.",
                },
              ].map((w) => (
                <div key={w.num} className="why-item">
                  <span className="why-num">{w.num}</span>
                  <div className="why-body">
                    <h3>{w.title}</h3>
                    <p>{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <video className="why-character" autoPlay loop muted playsInline>
              <source src="/Cafe-Personaje.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="services container">
        <div className="pricing-header reveal-up">
          <p className="pricing-tag">Planes de alianza mensual</p>
          <h2>Elige tu nivel</h2>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`pricing-card reveal-up${plan.featured ? " pricing-card--featured" : ""}`}
            >
              {plan.featured && <div className="plan-badge">Más popular</div>}
              <div className="pricing-card-top">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span
                    className={`plan-usd${plan.slug === "estrategico" ? " plan-custom" : ""}`}
                  >
                    {plan.usd}
                    {plan.period && (
                      <span className="plan-period">{plan.period}</span>
                    )}
                  </span>
                  <span className="plan-dop">{plan.dop}</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="plan-team">
                <span className="plan-team-label">Equipo </span>
                <span>{plan.team}</span>
              </div>
              {plan.limit && <p className="plan-limit">{plan.limit}</p>}
              <Link
                href={`/contacto?plan=${plan.slug}`}
                className="pricing-btn"
              >
                {plan.slug === "estrategico"
                  ? "Solicitar diagnóstico"
                  : "Empezar plan"}
              </Link>
            </div>
          ))}
        </div>
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
                style={{ height: "32px", width: "auto" }}
              />
            ))}
          </div>
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

      {/* CTA */}
      <CtaSection
        title="¿No sabes por dónde iniciar?"
        text="La solución para tu incertidumbre es una auditoría gratis. No procrastines más y agenda sin compromiso."
      />
    </div>
  );
}
