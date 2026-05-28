"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Header from "@/components/layout/Header";
import CtaSection from "@/components/CtaSection";

gsap.registerPlugin(ScrollTrigger);

const PARALLAX_IMG = "/equipo/equipo.jpg";

const SERVICES = [
  {
    num: "01",
    title: "Desarrollo Web & Diseño UX",
    img: "/proyectos/portada-web.jpg",
    desc: "Creamos sitios web y plataformas digitales que convierten visitantes en clientes. Cada proyecto es una solución de negocio, no solo una página bonita.",
    items: [
      "Sitios web corporativos",
      "E-commerce y marketplaces",
      "Plataformas SaaS",
      "Diseño UX/UI",
      "Optimización de conversión",
      "Mantenimiento y hosting",
    ],
  },
  {
    num: "02",
    title: "Identidad & Branding",
    img: "/proyectos/portada-branding.jpg",
    desc: "Construimos marcas que resisten el tiempo. Desde el naming hasta el manual de identidad, cada elemento tiene un propósito estratégico.",
    items: [
      "Identidad visual corporativa",
      "Manual de marca",
      "Naming y posicionamiento",
      "Diseño de packaging",
      "Materiales de marketing",
      "Señalética y merchandising",
    ],
  },
  {
    num: "03",
    title: "SEO & Marketing Digital",
    img: "/proyectos/portada-seo.jpg",
    desc: "Llevamos tu negocio a la primera página de Google y a los resultados de las IAs. Tráfico orgánico sostenible que no depende de publicidad pagada.",
    items: [
      "SEO técnico y de contenido",
      "SEO local y Google My Business",
      "Posicionamiento en IAs",
      "Estrategia de contenido",
      "Email marketing",
      "Analítica y reportes",
    ],
  },
  {
    num: "04",
    title: "Apps & Sistemas",
    img: "/proyectos/portada-app.jpg",
    desc: "Desarrollamos aplicaciones móviles y sistemas de gestión que automatizan procesos y escalan con tu negocio.",
    items: [
      "Apps iOS y Android",
      "Sistemas de gestión (CRM, ERP)",
      "Automatizaciones y bots",
      "APIs e integraciones",
      "Dashboards y reportes",
      "Mantenimiento y soporte",
    ],
  },
  {
    num: "05",
    title: "Producción Audiovisual",
    img: "/proyectos/portada-rebranding.jpg",
    desc: "Contenido que detiene el scroll. Fotografía, video y motion graphics con estándar de producción premium para redes sociales y publicidad.",
    items: [
      "Fotografía corporativa y de producto",
      "Producción de video y reels",
      "Motion graphics",
      "Fotografía mensual",
      "Dirección de arte",
      "Postproducción",
    ],
  },
];

export default function Servicios() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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

      gsap.to(".parallax-img", {
        y: "-20%",
        ease: "none",
        scrollTrigger: {
          trigger: ".team-parallax-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
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
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <span className="pricing-tag reveal-up">- Nuestra Experiencia</span>
        <h1
          className="reveal-up"
          style={{ fontSize: "clamp(3rem,10vw,8rem)", lineHeight: "0.9" }}
        >
          Servicios <br />
          <span className="cursive">Premium</span>
        </h1>
      </section>

      {/* Parallax equipo */}
      <section
        className="team-parallax-section"
        style={{ padding: "var(--section-pad-y) 0", overflow: "hidden" }}
      >
        <div
          style={{
            position: "relative",
            height: "70vh",
            overflow: "hidden",
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
          }}
        >
          <img
            src={PARALLAX_IMG}
            alt="Equipo C Digital"
            className="parallax-img"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "140%",
              objectFit: "cover",
              filter: "brightness(0.7)",
            }}
          />
        </div>
      </section>

      {/* Service sections */}
      {SERVICES.map((svc) => (
        <section
          key={svc.num}
          className="container reveal-up"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "var(--section-header-gap)",
            }}
          >
            <h2
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontWeight: 700,
              }}
            >
              {svc.title}
            </h2>
            <span
              style={{
                fontSize: "60px",
                fontWeight: 800,
                lineHeight: 1,
                opacity: 0.1,
              }}
            >
              {svc.num}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "60px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: "var(--muted-color)",
                maxWidth: "300px",
              }}
            >
              {svc.desc}
            </p>
            <ul style={{ listStyle: "none" }}>
              {svc.items.map((item, i) => (
                <li
                  key={item}
                  style={{
                    padding: "20px 0",
                    paddingTop: i === 0 ? 0 : "20px",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div
              style={{
                width: "100%",
                height: "400px",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
              <Image
                src={svc.img}
                alt={svc.title}
                width={600}
                height={400}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <CtaSection
        title="¿Listo para crecer?"
        text="Agenda una auditoría gratuita y te decimos exactamente qué necesita tu negocio digital."
      />
    </div>
  );
}
