"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

interface ProyectoProps {
  category: string; title: string; year: string; heroImg: string;
  description: string; challenge: string; solution: string;
  images: string[]; tags: string[];
  nextProject: { href: string; title: string };
}

export default function ProyectoLayout({ category, title, year, heroImg, description, challenge, solution, images, tags, nextProject }: ProyectoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach(el => {
      gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <Header dark />

      {/* Hero */}
      <section style={{ height: "90vh", overflow: "hidden", position: "relative" }}>
        <Image src={heroImg} alt={title} fill style={{ objectFit: "cover" }} priority />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "80px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", marginBottom: "16px" }}>{category} — {year}</p>
          <h1 style={{ fontSize: "clamp(3rem,7vw,7rem)", color: "#fff", lineHeight: "0.9" }}>{title}</h1>
        </div>
      </section>

      {/* Tags + description */}
      <section className="container reveal-up">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "80px" }}>
          <div>
            <p className="pricing-tag">Etiquetas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
              {tags.map(t => <span key={t} style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", padding: "6px 14px", border: "1px solid rgba(0,0,0,0.15)" }}>{t}</span>)}
            </div>
          </div>
          <p style={{ fontSize: "20px", lineHeight: "1.7", color: "var(--muted-color)" }}>{description}</p>
        </div>
      </section>

      {/* Challenge + Solution */}
      <section className="container reveal-up" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px" }}>
          {[{ label: "El reto", body: challenge }, { label: "La solución", body: solution }].map(item => (
            <div key={item.label} style={{ borderTop: "1px solid var(--border-color)", paddingTop: "40px" }}>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>{item.label}</h3>
              <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--muted-color)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Images */}
      {images.length > 0 && (
        <section className="container reveal-up" style={{ paddingTop: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr", gap: "24px" }}>
            {images.map((src, i) => (
              <div key={i} style={{ overflow: "hidden", aspectRatio: "16/10" }}>
                <Image src={src} alt="" width={800} height={500} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next project */}
      <section style={{ background: "#0a0a0a", padding: "120px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "16px" }}>Siguiente proyecto</p>
            <h2 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,4rem)" }}>{nextProject.title}</h2>
          </div>
          <Link href={nextProject.href} className="cta-btn" style={{ flexShrink: 0 }}>Ver proyecto</Link>
        </div>
      </section>
    </div>
  );
}
