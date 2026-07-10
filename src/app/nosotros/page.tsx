"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { ReactGoogleReviews } from "react-google-reviews";
import CtaSection from "@/components/CtaSection";
import "react-google-reviews/dist/index.css";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  {
    name: "Rachel Suero",
    role: "Directora General",
    bio: "La mente detrás de cada decisión que mueve la agencia hacia adelante. Rachel combina visión de negocio con instinto creativo para liderar proyectos que no solo se ven bien, sino que generan resultados reales.",
    photo: "/equipo/rachel.jpg",
  },
  {
    name: "Vladimir Gabriel",
    role: "Director Creativo",
    bio: "Donde otros ven un brief, Vladimir ve una historia. Guía la dirección creativa de cada campaña con un estándar visual que desafía lo ordinario.",
    photo: "/equipo/vladimir.jpg",
  },
  {
    name: "Carlos Díaz",
    role: "Product Designer",
    bio: "Carlos transforma ideas complejas en experiencias simples y poderosas. Su obsesión por el detalle y la usabilidad convierte cada producto digital en algo que los usuarios disfrutan.",
    photo: "/equipo/actualizando.jpg",
  },
  {
    name: "Josue Sanchez",
    role: "Desarrollador",
    bio: "Josue es quien hace que todo funcione. Con una mentalidad orientada a soluciones, desarrolla funcionalidades robustas al servicio del usuario final.",
    photo: "/equipo/josue.jpg",
  },
  {
    name: "Sarahlia Villar",
    role: "Graphic Designer",
    bio: "Sarahlia traduce la identidad de cada marca en piezas visuales que detienen el scroll y generan conversación.",
    photo: "/equipo/actualizando.jpg",
  },
  {
    name: "Maximo Ismael",
    role: "Audiovisual",
    bio: "Maximo convierte horas de grabación en piezas que enganchan desde el primer segundo. Su edición tiene ritmo, intención y ese toque premium.",
    photo: "/equipo/actualizando.jpg",
  },
  {
    name: "Cinthia Paulino",
    role: "Employer Brand",
    bio: "Cinthia ayuda a las empresas de nuestros clientes a convertirse en lugares donde la gente quiere trabajar. Construye marcas empleadoras con propósito real.",
    photo: "/equipo/IMG_7714.JPG.jpg",
  },
];

const PHOTOS = [
  "/equipo/DSC_9871 1.jpg",
  "/equipo/DSC_9911 3.jpg",
  "/equipo/DSC_9911 4.jpg",
  "/equipo/DSC_9911 5.jpg",
];

const VALUES = [
  {
    title: "Diagnóstico antes que servicios",
    body: "No vendemos un plan hasta entender exactamente dónde está el dinero perdido en tu negocio. El diagnóstico define qué se hace, en qué orden y por qué.",
  },
  {
    title: "Sistema, no piezas sueltas",
    body: "Un logo sin estrategia, o publicidad sin proceso de venta, no genera ROI. Todo lo que hacemos está conectado: marca, captación y conversión trabajan como uno solo.",
  },
  {
    title: "Métricas que importan",
    body: 'No te reportamos "likes" ni "alcance". Te reportamos leads generados, costo por contacto y cuánto movió la aguja en ventas — cada mes, sin excepciones.',
  },
];

export default function Nosotros() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [teamIdx, setTeamIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const WIDGET_ID = process.env.NEXT_PUBLIC_WIDGET_ID ?? "";

  const goTo = (idx: number) => {
    setFading(true);
    setTimeout(() => {
      setTeamIdx(idx);
      setFading(false);
    }, 400);
  };

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
    },
    { scope: containerRef },
  );

  const member = TEAM[teamIdx];

  return (
    <div ref={containerRef}>
      <Header />

      {/* Hero */}
      <section
        className="container"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            alignItems: "center",
            gap: "40px",
            width: "100%",
          }}
        >
          <h1
            className="reveal-up"
            style={{
              fontSize: "clamp(4rem,12vw,10rem)",
              lineHeight: "0.85",
              margin: 0,
            }}
          >
            Agencia <br />
            <span
              className="cursive"
              style={{
                fontSize: "clamp(3rem,8vw,6rem)",
                display: "block",
                marginTop: "-20px",
              }}
            >
              - nosotros
            </span>
          </h1>
          <p
            className="reveal-up"
            style={{
              fontSize: "16px",
              color: "var(--muted-color)",
              maxWidth: "300px",
              marginBottom: "20px",
            }}
          >
            No somos la típica agencia. Somos el equipo que convierte el caos
            digital de tu negocio en resultados que puedes medir.
          </p>
        </div>
      </section>

      {/* Photo carousel */}
      <section style={{ padding: "80px 0", overflow: "hidden" }}>
        <div className="nosotros-carousel">
          <div className="nosotros-track">
            {[...PHOTOS, ...PHOTOS].map((src, i) => (
              <div key={i} className="nosotros-slide">
                <Image
                  src={src}
                  alt="Equipo C Digital"
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section
        className="container reveal-up"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "100px",
          padding: "120px 40px",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2.5rem,5vw,4.5rem)",
            lineHeight: "1.1",
            fontWeight: 700,
          }}
        >
          Cada peso que <span className="cursive">inviertes</span>
          <br />
          tiene que <span className="cursive">regresar</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontWeight: 700,
                  marginBottom: "15px",
                }}
              >
                {v.title}
              </h3>
              <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333" }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team slider */}
      <section
        style={{ padding: "var(--section-pad-y) 0", background: "#fff" }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px minmax(0,480px) 1fr",
              gap: "60px",
              alignItems: "start",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(2rem,3vw,3rem)",
                  lineHeight: "1",
                  letterSpacing: "-2px",
                  marginBottom: "16px",
                }}
              >
                Conoce nuestro <br />
                equipo <span className="cursive">elite</span>
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.75",
                  color: "var(--muted-color)",
                  marginBottom: "32px",
                }}
              >
                Cada miembro es experto en su área y pieza fundamental para
                mejorar los resultados de tu negocio.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {TEAM.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    style={{
                      width: "72px",
                      height: "96px",
                      overflow: "hidden",
                      opacity: i === teamIdx ? 1 : 0.3,
                      transition: "opacity 0.4s",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background: "#e8e8e8",
                    }}
                  >
                    <Image
                      src={m.photo}
                      alt={m.name}
                      width={72}
                      height={96}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                overflow: "hidden",
                background: "#e8e8e8",
                aspectRatio: "3/4",
              }}
            >
              <Image
                src={member.photo}
                alt={member.name}
                width={480}
                height={640}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                  opacity: fading ? 0 : 1,
                  transition: "opacity 0.4s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "400px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "clamp(2.5rem,4vw,4.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-2px",
                    lineHeight: "0.95",
                    textTransform: "none",
                    marginBottom: "8px",
                  }}
                >
                  {member.name}
                </h3>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "20px",
                  }}
                >
                  {member.role}
                </span>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "var(--muted-color)",
                  }}
                >
                  {member.bio}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() =>
                    goTo((teamIdx - 1 + TEAM.length) % TEAM.length)
                  }
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ←
                </button>
                <button
                  onClick={() => goTo((teamIdx + 1) % TEAM.length)}
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="testimonials container">
        <div className="testimonials-header reveal-up">
          <p className="pricing-tag">Reseñas</p>
          <h2>¿Qué dicen nuestros clientes?</h2>
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
