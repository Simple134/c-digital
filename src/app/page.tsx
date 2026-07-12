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
import { LOGOS, OBJECTIVES, PORTFOLIO, WHY_QUESTIONS } from "@/lib/home-data";

gsap.registerPlugin(ScrollTrigger);

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
            anticipatePin: 1,
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
              <Link href="/form" className="cta-btn cta-btn--ghost">
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
                {obj.badge && <span className="obj-badge">{obj.badge}</span>}
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
            <div className="why-progress" aria-hidden="true">
              {WHY_QUESTIONS.map((w) => (
                <span key={w.num} className="why-progress-pip" />
              ))}
            </div>
            <div className="why-items">
              {WHY_QUESTIONS.map((w) => (
                <div key={w.num} className="why-item">
                  <span className="why-num">{w.num}</span>
                  <p className="why-question">{w.q}</p>
                </div>
              ))}
            </div>

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
              <Link href="/form" className="cta-btn cta-btn--ghost">
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
