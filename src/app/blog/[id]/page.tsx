"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

export default function BlogArticle() {
  const [activeSection, setActiveSection] = useState("");
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
    },
    { scope: containerRef },
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll<HTMLElement>(
        ".article-body h2[id]",
      );
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tocItems = [
    { id: "antes-de-buscar", label: "Antes de buscar una agencia" },
    { id: "que-hacen", label: "Qué hacen realmente las agencias" },
    { id: "como-elegir", label: "Cómo elegir la correcta" },
    { id: "preguntas", label: "Preguntas clave para la reunión" },
    { id: "senales", label: "Señales de una buena agencia" },
    { id: "conclusion", label: "Conclusión" },
  ];

  return (
    <div ref={containerRef}>
      <Header />

      {/* Article Hero */}
      <section className="article-hero container">
        <div className="article-hero-meta">
          <span className="blog-cat">Marketing Digital</span>
          <span className="blog-date">19 Enero 2026</span>
          <span className="blog-date">· 15 min de lectura</span>
        </div>
        <h1 className="reveal-up">
          Guía Definitiva para Contratar una Agencia de Marketing Digital en
          2026
        </h1>
      </section>

      {/* Featured Image */}
      <div className="article-featured-img container">
        <Image
          src="/blog1.png"
          alt="Guía para contratar agencia de marketing digital"
          width={1200}
          height={560}
          style={{
            width: "100%",
            maxHeight: "560px",
            objectFit: "cover",
            display: "block",
          }}
          priority
        />
      </div>

      {/* Article Layout: TOC + Body */}
      <div className="article-layout container">
        {/* Table of Contents */}
        <aside className="article-toc reveal-up">
          <h4>Contenido</h4>
          <ol>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeSection === item.id ? "active" : ""}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* Article Body */}
        <article className="article-body reveal-up">
          <p>
            Elegir una agencia de marketing digital es una de las decisiones más
            importantes que puede tomar un empresario. Esta elección impacta
            directamente tus ventas, la reputación de tu marca y el crecimiento
            sostenible de tu negocio. Sin embargo, el mercado está lleno de
            promesas vacías y opciones que se parecen mucho por fuera pero
            difieren radicalmente por dentro.
          </p>

          <div className="article-highlight">
            <p>
              El 78% de las PYMES que trabajan con agencias especializadas
              reportan un crecimiento de ingresos del 30% o más durante su
              primer año. Pero el 45% admite haber contratado al menos una
              agencia incorrecta antes de encontrar la correcta.
            </p>
          </div>

          <p>
            Esta guía está diseñada para que no seas parte de ese 45%. Te
            explicamos paso a paso cómo prepararte, qué buscar y qué preguntas
            hacer antes de firmar cualquier contrato.
          </p>

          <h2 id="antes-de-buscar">
            1. Antes de buscar una agencia: la preparación es tu ventaja
          </h2>

          <p>
            El error más común es comenzar a buscar agencias sin tener claridad
            interna. Antes de hablar con alguien, debes definir tres cosas con
            precisión:
          </p>
          <ul>
            <li>
              <strong>Objetivos específicos y medibles:</strong> no
              &ldquo;quiero más ventas&rdquo;, sino &ldquo;quiero aumentar mis
              ventas online un 40% en los próximos 6 meses&rdquo;.
            </li>
            <li>
              <strong>Un presupuesto realista:</strong> microempresas pueden
              partir desde $500–$1,500/mes; pequeñas empresas entre
              $1,500–$4,000/mes; medianas empresas, $4,000+.
            </li>
            <li>
              <strong>Tu capacidad interna:</strong> ¿tienes equipo que pueda
              colaborar? ¿Puedes aprobar contenido rápidamente? ¿Tienes acceso a
              tus plataformas?
            </li>
          </ul>
          <p>
            Una agencia seria te pedirá estas respuestas en la primera reunión.
            Si no lo hace, es una señal de alerta.
          </p>

          <h2 id="que-hacen">
            2. Qué hacen realmente las agencias profesionales
          </h2>

          <p>
            Existe una gran diferencia entre lo que una agencia promete y lo que
            realmente ejecuta. Una agencia profesional no solo &ldquo;posta en
            redes&rdquo; — desarrolla una estrategia integral que incluye:
          </p>
          <ul>
            <li>
              Análisis profundo de la competencia y construcción del buyer
              persona
            </li>
            <li>Producción de contenido estratégico con diseño profesional</li>
            <li>Gestión activa de comunidades digitales</li>
            <li>
              Campañas de publicidad paga optimizadas con presupuesto controlado
            </li>
            <li>
              Reportes con métricas reales: alcance, conversiones, costo por
              lead, ROI
            </li>
          </ul>

          <div className="article-highlight">
            <p>
              Una agencia que no puede mostrarte métricas claras y resultados
              documentados de clientes anteriores no está lista para manejar tu
              inversión.
            </p>
          </div>

          <h2 id="como-elegir">3. Cómo elegir la agencia correcta</h2>

          <p>
            El proceso de selección debe ser tan riguroso como contratar a un
            empleado clave. Estos son los tres filtros principales:
          </p>
          <ol>
            <li>
              <strong>Verifica su experiencia con casos documentados:</strong>{" "}
              pide ejemplos reales con resultados medibles, no solo diseños
              bonitos o capturas de pantalla de métricas sin contexto.
            </li>
            <li>
              <strong>Exige transparencia y promesas realistas:</strong>{" "}
              desconfía de quien garantice contenido viral, primeras posiciones
              en Google en días o resultados inmediatos sin datos que lo
              respalden.
            </li>
            <li>
              <strong>Evalúa su metodología de medición:</strong> ¿Cómo definen
              el éxito? ¿Cada cuánto reportan? ¿Qué herramientas usan?
            </li>
          </ol>

          <h2 id="preguntas">4. Preguntas clave para tu primera reunión</h2>

          <p>
            Llega preparado con estas seis preguntas. Las respuestas te dirán
            todo lo que necesitas saber:
          </p>
          <ol>
            <li>
              <strong>¿Cómo definen el éxito para un cliente como yo?</strong> —
              deben hablar de métricas específicas, no de
              &ldquo;visibilidad&rdquo; o &ldquo;engagement&rdquo;.
            </li>
            <li>
              <strong>
                ¿Quién será mi punto de contacto y con qué frecuencia se
                comunican?
              </strong>{" "}
              — evita agencias donde nadie responde hasta el día del reporte.
            </li>
            <li>
              <strong>¿Qué incluye exactamente el servicio?</strong> — pide un
              desglose escrito de entregables por mes.
            </li>
            <li>
              <strong>
                ¿Qué pasa si no se alcanzan los resultados esperados?
              </strong>{" "}
              — una agencia confiable tiene un protocolo claro para esto.
            </li>
            <li>
              <strong>
                ¿A quién pertenecen las cuentas y el contenido creado?
              </strong>{" "}
              — todo activo digital debe ser de tu propiedad.
            </li>
            <li>
              <strong>
                ¿Pueden darme referencias verificables de clientes actuales?
              </strong>{" "}
              — no testimonios de su web, sino contactos reales a quienes puedas
              llamar.
            </li>
          </ol>

          <h2 id="senales">5. Señales de una buena agencia</h2>

          <p>
            Más allá de las respuestas que recibas, observa cómo se comportan
            durante el proceso de ventas. Una agencia que realmente funciona
            bien:
          </p>
          <ul>
            <li>
              Comunica sin jerga técnica innecesaria y adapta su lenguaje a tu
              nivel
            </li>
            <li>
              Tiene experiencia específica trabajando con PYMES y emprendedores
            </li>
            <li>
              Prioriza construir tu marca a largo plazo sobre resultados
              inmediatos de vanidad
            </li>
            <li>
              Llega a la primera reunión habiendo investigado tu negocio y
              competencia
            </li>
            <li>Es honesta sobre lo que puede y no puede lograr</li>
          </ul>

          <div className="article-highlight">
            <p>
              Si en la primera reunión la agencia habla más de sus logros que de
              entender tu negocio, esa es tu señal para seguir buscando.
            </p>
          </div>

          <h2 id="conclusion">
            6. Conclusión: una inversión estratégica, no un gasto
          </h2>

          <p>
            Contratar una agencia de marketing digital es una inversión en el
            crecimiento de tu negocio, no un gasto operativo más. Tomarte el
            tiempo para evaluar correctamente puede ahorrarte meses de
            frustración y miles de dólares desperdiciados.
          </p>
          <p>
            El marketing digital profesional puede transformar completamente la
            trayectoria de tu empresa — pero solo si eliges al aliado correcto.
            Con la preparación adecuada, las preguntas correctas y los criterios
            claros que esta guía te ofrece, estás en una posición mucho mejor
            para tomar esa decisión con confianza.
          </p>
          <p>
            ¿Tienes preguntas sobre cómo C Digital Studio puede ayudarte?{" "}
            <Link
              href="/contacto"
              style={{
                color: "inherit",
                textDecoration: "underline",
                fontWeight: 700,
              }}
            >
              Agenda una consulta gratuita
            </Link>{" "}
            y te respondemos en menos de 24 horas.
          </p>

          {/* Author Card */}
          <div className="article-author-card">
            <div className="article-author-avatar">
              <Image
                src="/blog1.png"
                alt="C Digital Team"
                width={60}
                height={60}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="article-author-info">
              <strong>C Digital Team</strong>
              <span>
                Agencia de marketing digital y diseño para PYMES en RD
              </span>
            </div>
          </div>
        </article>
      </div>

      {/* Back to blog */}
      <div
        className="container"
        style={{ paddingBottom: "var(--section-pad-y)", paddingTop: "40px" }}
      >
        <Link href="/blog" className="cta-btn" style={{ color: "#000" }}>
          ← Volver al blog
        </Link>
      </div>
    </div>
  );
}
