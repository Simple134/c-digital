"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";

gsap.registerPlugin(ScrollTrigger);

const POSTS = [
  {
    id: "guia-contratar-agencia",
    category: "Estrategia",
    title: "Guía para contratar una agencia digital: lo que nadie te dice",
    excerpt: "Antes de firmar un contrato con una agencia, necesitas hacerte estas preguntas. Aprende a evaluar propuestas, detectar red flags y elegir el socio correcto para tu negocio.",
    date: "10 mayo 2026",
    img: "/proyectos/portada-branding.jpg",
  },
];

export default function Blog() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach(el => {
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <Header />

      {/* Hero */}
      <section className="container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "80px" }}>
        <span className="pricing-tag reveal-up">Recursos y conocimiento</span>
        <h1 className="reveal-up" style={{ fontSize: "clamp(3.5rem,8vw,7rem)", lineHeight: "0.9" }}>Blog</h1>
      </section>

      {/* Posts */}
      <section className="container" style={{ paddingTop: 0 }}>
        {POSTS.map(post => (
          <Link key={post.id} href={`/blog/${post.id}`}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", textDecoration: "none", color: "inherit", borderTop: "1px solid var(--border-color)", paddingTop: "60px", paddingBottom: "60px" }}>
            <div style={{ overflow: "hidden", aspectRatio: "16/9" }}>
              <Image src={post.img} alt={post.title} width={800} height={450}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>
              <span className="pricing-tag">{post.category}</span>
              <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", lineHeight: "1.1" }}>{post.title}</h2>
              <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--muted-color)" }}>{post.excerpt}</p>
              <span style={{ fontSize: "11px", color: "var(--muted-color)", textTransform: "uppercase", letterSpacing: "2px" }}>{post.date}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
