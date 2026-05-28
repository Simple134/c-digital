"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

gsap.registerPlugin(ScrollTrigger);

interface ProyectoProps {
  category: string;
  title: string;
  publishedDate: string;
  country: string;
  industry: string;
  service: string;
  heroImg: string;
  overviewSubtitle: string;
  overviewText: string;
  servicesList: string[];
  conceptWord: string;
  conceptTitle: string;
  conceptText: string;
  galleryImg1: string;
  galleryWord1: string;
  challengeText: string;
  galleryImg2: string;
  galleryWord2: string;
  resultText: string;
  carouselImages: string[];
  projectUrl?: string;
  nextProject: { href: string; title: string; subtitle: string };
}

function FloatingWord({
  word,
  style,
}: {
  word: string;
  style: React.CSSProperties;
}) {
  return (
    <span
      className="floating-text"
      style={{
        position: "absolute",
        fontSize: "15vw",
        fontWeight: 800,
        textTransform: "uppercase",
        color: "rgba(0,0,0,0.03)",
        zIndex: -1,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        ...style,
      }}
    >
      {word}
    </span>
  );
}

export default function ProyectoLayout({
  category,
  title,
  publishedDate,
  country,
  industry,
  service,
  heroImg,
  overviewSubtitle,
  overviewText,
  servicesList,
  conceptWord,
  conceptTitle,
  conceptText,
  galleryImg1,
  galleryWord1,
  challengeText,
  galleryImg2,
  galleryWord2,
  resultText,
  carouselImages,
  projectUrl,
  nextProject,
}: ProyectoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
      gsap.utils.toArray<HTMLElement>(".floating-text").forEach((text) => {
        gsap.to(text, {
          x: -200,
          scrollTrigger: {
            trigger: text,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <Header />

      {/* Hero */}
      <section
        className="container"
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          paddingTop: "180px",
          paddingBottom: 0,
        }}
      >
        <p
          className="reveal-up"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: "var(--muted-color)",
            marginBottom: "24px",
          }}
        >
          {category}
        </p>
        <h1
          className="reveal-up"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            maxWidth: "1000px",
            lineHeight: "0.95",
            marginBottom: "60px",
          }}
        >
          {title}
        </h1>
        <div
          className="reveal-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "40px",
            padding: "60px 0",
            borderTop: "1px solid var(--border-color)",
            borderBottom: "1px solid var(--border-color)",
            marginBottom: "100px",
            width: "100%",
          }}
        >
          {[
            { label: "Publicado", value: publishedDate },
            { label: "País", value: country },
            { label: "Industria", value: industry },
            { label: "Servicio", value: service },
          ].map(({ label, value }) => (
            <div key={label}>
              <span
                style={{
                  display: "block",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: "var(--muted-color)",
                  marginBottom: "8px",
                }}
              >
                {label}
              </span>
              <strong
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* Hero image — full width */}
      <section className="container reveal-up">
        <div style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
          <Image
            src={heroImg}
            alt={title}
            width={1920}
            height={1080}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </section>

      {/* Overview */}
      <section className="container" style={{ padding: "160px 0" }}>
        <div
          className="reveal-up"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "4px",
                color: "var(--muted-color)",
                marginBottom: "24px",
                textTransform: "uppercase",
              }}
            >
              Visión General
            </h2>
            <h3
              style={{
                fontSize: "32px",
                lineHeight: "1.2",
                marginBottom: "40px",
              }}
            >
              {overviewSubtitle}
            </h3>
          </div>
          <div>
            <p style={{ fontSize: "18px", lineHeight: "1.7" }}>
              {overviewText}
            </p>
            <div style={{ marginTop: "40px" }}>
              <h4
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: "var(--muted-color)",
                  marginBottom: "20px",
                }}
              >
                Servicios Prestados
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {servicesList.map((item) => (
                  <li
                    key={item}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border-color)",
                      fontSize: "13px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Concept section */}
      <section
        className="container"
        style={{ position: "relative", padding: "200px 0", overflow: "hidden" }}
      >
        <FloatingWord word={conceptWord} style={{ top: 0, left: 0 }} />
        <div
          className="reveal-up"
          style={{
            maxWidth: "600px",
            marginLeft: "auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h2 style={{ fontSize: "40px", marginBottom: "32px" }}>
            {conceptTitle}
          </h2>
          <p style={{ fontSize: "18px", lineHeight: "1.8" }}>{conceptText}</p>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          {/* Image 1 — right */}
          <div
            className="reveal-up"
            style={{
              marginBottom: "160px",
              position: "relative",
              maxWidth: "60%",
              marginLeft: "auto",
            }}
          >
            <FloatingWord
              word={galleryWord1}
              style={{ top: "-50px", right: 0 }}
            />
            <Image
              src={galleryImg1}
              alt=""
              width={1200}
              height={800}
              style={{ width: "100%", display: "block" }}
            />
          </div>

          {/* Challenge */}
          <div
            className="reveal-up"
            style={{
              position: "relative",
              paddingTop: "100px",
              paddingBottom: "100px",
              overflow: "hidden",
            }}
          >
            <FloatingWord word="CHALLENGE" style={{ bottom: 0, right: 0 }} />
            <div style={{ maxWidth: "600px", position: "relative", zIndex: 2 }}>
              <h2 style={{ fontSize: "40px", marginBottom: "32px" }}>
                El desafío
              </h2>
              <p style={{ fontSize: "18px", lineHeight: "1.8" }}>
                {challengeText}
              </p>
            </div>
          </div>

          {/* Image 2 — left */}
          <div
            className="reveal-up"
            style={{
              marginTop: "80px",
              marginBottom: "160px",
              position: "relative",
              maxWidth: "60%",
            }}
          >
            <FloatingWord
              word={galleryWord2}
              style={{ bottom: "-50px", left: 0 }}
            />
            <Image
              src={galleryImg2}
              alt=""
              width={1200}
              height={800}
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* Result section */}
      <section
        className="container"
        style={{ position: "relative", padding: "200px 0", overflow: "hidden" }}
      >
        <FloatingWord word="RESULTS" style={{ top: 0, left: 0 }} />
        <div
          className="reveal-up"
          style={{
            maxWidth: "600px",
            marginLeft: "auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h2 style={{ fontSize: "40px", marginBottom: "32px" }}>
            El resultado
          </h2>
          <p style={{ fontSize: "18px", lineHeight: "1.8" }}>{resultText}</p>
        </div>
      </section>

      {/* Carousel — dark bg */}
      {carouselImages.length > 0 && (
        <section
          style={{
            padding: "160px 0",
            overflow: "hidden",
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          <div className="container">
            <h2
              className="reveal-up"
              style={{
                textAlign: "center",
                marginBottom: "80px",
                fontSize: "40px",
              }}
            >
              Galería del Proyecto
            </h2>
          </div>
          <div className="reveal-up">
            <Swiper
              modules={[Autoplay]}
              slidesPerView="auto"
              centeredSlides
              spaceBetween={30}
              loop
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              style={{ padding: "50px 0" }}
            >
              {carouselImages.map((src, i) => (
                <SwiperSlide key={i} style={{ width: "800px" }}>
                  <Image
                    src={src}
                    alt=""
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        className="container reveal-up"
        style={{
          padding: "60px 0",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--muted-color)" }}>
          ¿Te gustó este proyecto?
        </span>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-color)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "var(--transition)",
            }}
          >
            Ver video
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </button>
          {projectUrl ? (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                textDecoration: "none",
                color: "var(--text-color)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "var(--transition)",
              }}
            >
              Visitar proyecto
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-color)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "var(--transition)",
              }}
            >
              Visitar proyecto
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* Next project */}
      <section
        className="container reveal-up"
        style={{
          padding: "160px 0",
          textAlign: "center",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: "var(--muted-color)",
            marginBottom: "20px",
            display: "block",
          }}
        >
          Siguiente Proyecto
        </span>
        <Link
          href={nextProject.href}
          style={{
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 800,
            textTransform: "uppercase",
            textDecoration: "none",
            color: "var(--text-color)",
            display: "inline-block",
            transition: "var(--transition)",
          }}
        >
          {nextProject.title} <br />{" "}
          <span className="cursive" style={{ textTransform: "none" }}>
            {nextProject.subtitle}
          </span>
        </Link>
      </section>

      {/* Pending modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "48px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "360px",
            }}
          >
            <span style={{ fontSize: "32px" }}>🔗</span>
            <h3 style={{ marginTop: "16px", marginBottom: "12px" }}>
              Enlace no disponible
            </h3>
            <p style={{ color: "var(--muted-color)", marginBottom: "24px" }}>
              Este contenido aún no ha sido publicado.
              <br />
              Pronto estará disponible.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                background: "none",
                border: "1px solid var(--border-color)",
                padding: "10px 24px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              ← Volver atrás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
