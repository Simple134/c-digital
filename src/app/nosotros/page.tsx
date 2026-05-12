"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  { name: "Rachel Suero", role: "Directora General", bio: "La mente detrás de cada decisión que mueve la agencia hacia adelante. Rachel combina visión de negocio con instinto creativo para liderar proyectos que no solo se ven bien, sino que generan resultados reales.", photo: "/assets/p1.png" },
  { name: "Vladimir Gabriel", role: "Director Creativo", bio: "Donde otros ven un brief, Vladimir ve una historia. Guía la dirección creativa de cada campaña con un estándar visual que desafía lo ordinario.", photo: "/assets/p1.png" },
  { name: "Carlos Díaz", role: "Product Designer", bio: "Carlos transforma ideas complejas en experiencias simples y poderosas. Su obsesión por el detalle y la usabilidad convierte cada producto digital en algo que los usuarios disfrutan.", photo: "/assets/p2.png" },
  { name: "Elberth Corniell", role: "Senior Developer", bio: "La arquitectura detrás de cada plataforma. Elberth lleva años convirtiendo diseños ambiciosos en código limpio, rápido y escalable.", photo: "/assets/p2.png" },
  { name: "Josue Sanchez", role: "Programador", bio: "Josue es quien hace que todo funcione. Con una mentalidad orientada a soluciones, desarrolla funcionalidades robustas al servicio del usuario final.", photo: "/assets/p3.png" },
  { name: "Sarahlia Villar", role: "Graphic Designer", bio: "Sarahlia traduce la identidad de cada marca en piezas visuales que detienen el scroll y generan conversación.", photo: "/assets/p3.png" },
  { name: "Maximo Ismael", role: "Audiovisual", bio: "Maximo convierte horas de grabación en piezas que enganchan desde el primer segundo. Su edición tiene ritmo, intención y ese toque premium.", photo: "/assets/p4.png" },
  { name: "Cinthia Paulino", role: "Employer Brand", bio: "Cinthia ayuda a las empresas de nuestros clientes a convertirse en lugares donde la gente quiere trabajar. Construye marcas empleadoras con propósito real.", photo: "/equipo/IMG_7714.JPG.jpg" },
];

const PHOTOS = ["/equipo/DSC_9871 1.jpg", "/equipo/DSC_9911 3.jpg", "/equipo/DSC_9911 4.jpg", "/equipo/DSC_9911 5.jpg"];

const STATS = [
  { num: "5+", label: "Años de experiencia" },
  { num: "80+", label: "Proyectos completados" },
  { num: "40+", label: "Clientes activos" },
  { num: "98%", label: "Satisfacción" },
];

const VALUES = [
  { title: "Promesas vacías y falta de resultados", body: "Entendemos la frustración de invertir en agencias que prometen el cielo y entregan reportes sin valor real. Aquí no vendemos humo; construimos estrategias basadas en datos que generan retorno de inversión tangible." },
  { title: "Informalidad y mala comunicación", body: "Sabemos lo que es el silencio de una agencia cuando más la necesitas. Nos diferenciamos por una comunicación proactiva y el cumplimiento obsesivo de los plazos, respetando tu tiempo y tu negocio." },
  { title: "Irresponsabilidad en la ejecución", body: "Muchos empresarios han sufrido proyectos a medias o costos ocultos de último momento. En C Digital Studio, la honestidad es nuestra base: lo que acordamos es exactamente lo que recibes." },
];

export default function Nosotros() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [teamIdx, setTeamIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const WIDGET_ID = process.env.NEXT_PUBLIC_WIDGET_ID ?? "";

  const goTo = (idx: number) => {
    setFading(true);
    setTimeout(() => { setTeamIdx(idx); setFading(false); }, 400);
  };

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach(el => {
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      });
    });
  }, { scope: containerRef });

  const member = TEAM[teamIdx];

  return (
    <div ref={containerRef}>
      <Header />

      {/* Hero */}
      <section className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center", gap: "40px", width: "100%" }}>
          <h1 className="reveal-up" style={{ fontSize: "clamp(4rem,12vw,10rem)", lineHeight: "0.85" }}>
            Agencia <br /><span className="cursive">- nosotros</span>
          </h1>
          <p className="reveal-up" style={{ fontSize: "16px", color: "var(--muted-color)", maxWidth: "300px" }}>
            Creamos historias de experiencia impactantes. Nos apasiona nuestro trabajo y cómo impacta positivamente en nuestros clientes.
          </p>
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ padding: "80px 0", overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", gap: "20px", padding: "0 40px" }}>
          {PHOTOS.map((src, i) => (
            <div key={i} style={{ flex: "0 0 600px", height: "400px", overflow: "hidden" }}>
              <Image src={src} alt="Equipo C Digital" width={600} height={400}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="container reveal-up" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "100px" }}>
        <h2 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", lineHeight: "1.1", fontWeight: 700 }}>
          Somos la <span className="cursive">solución completa</span> para las PYMES.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
          {VALUES.map(v => (
            <div key={v.title}>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 700, marginBottom: "15px" }}>{v.title}</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333" }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container reveal-up" style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "20px", margin: "100px auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "40px", padding: "80px 40px" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: "60px", fontWeight: 800, display: "block", background: "var(--main-gradient)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</span>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#666" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team slider */}
      <section style={{ padding: "var(--section-pad-y) 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0,480px) 1fr", gap: "60px", alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: "clamp(2rem,3vw,3rem)", lineHeight: "1", letterSpacing: "-2px", marginBottom: "16px" }}>
                Conoce nuestro <br />equipo <span className="cursive">elite</span>
              </h2>
              <p style={{ fontSize: "15px", lineHeight: "1.75", color: "var(--muted-color)", marginBottom: "32px" }}>
                Cada miembro es experto en su área y pieza fundamental para mejorar los resultados de tu negocio.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {TEAM.map((m, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    style={{ width: "72px", height: "96px", overflow: "hidden", opacity: i === teamIdx ? 1 : 0.3, transition: "opacity 0.4s", border: "none", padding: 0, cursor: "pointer", background: "#e8e8e8" }}>
                    <Image src={m.photo} alt={m.name} width={72} height={96}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflow: "hidden", background: "#e8e8e8", aspectRatio: "3/4" }}>
              <Image src={member.photo} alt={member.name} width={480} height={640}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: fading ? 0 : 1, transition: "opacity 0.4s" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "400px" }}>
              <div>
                <h3 style={{ fontSize: "clamp(2.5rem,4vw,4.5rem)", fontWeight: 800, letterSpacing: "-2px", lineHeight: "0.95", textTransform: "none", marginBottom: "8px" }}>{member.name}</h3>
                <span style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "20px" }}>{member.role}</span>
                <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--muted-color)" }}>{member.bio}</p>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button onClick={() => goTo((teamIdx - 1 + TEAM.length) % TEAM.length)} style={{ width: "44px", height: "44px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", fontSize: "18px" }}>←</button>
                <button onClick={() => goTo((teamIdx + 1) % TEAM.length)} style={{ width: "44px", height: "44px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", fontSize: "18px" }}>→</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container reveal-up">
        <p className="pricing-tag">Reseñas</p>
        <h2 style={{ fontSize: "clamp(2.4rem,4vw,4rem)", letterSpacing: "-2px", marginBottom: "60px" }}>
          ¿Qué dicen <br />nuestros clientes?
        </h2>
        {WIDGET_ID && <ReactGoogleReviews layout="badge" featurableId={WIDGET_ID} />}
      </section>

      {/* CTA */}
      <section className="cta-section reveal-up">
        <div className="cta-inner container">
          <div className="cta-video-wrap">
            <video autoPlay loop muted playsInline>
              <source src="/Video de mujer.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="cta-content">
            <p className="pricing-tag">Hora de decidir</p>
            <h2>¿No sabes por dónde iniciar?</h2>
            <p className="cta-text">La solución para tu incertidumbre es una auditoría gratis. No procrastines más y agenda sin compromiso.</p>
            <Link href="/contacto" className="cta-btn">Agendar auditoría</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
