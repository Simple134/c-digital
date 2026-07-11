"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/layout/Header";
import { getPostBySlug } from "@/lib/content";
import { revealPending } from "@/lib/reveal";
import type { Post } from "@/lib/supabase/types";

gsap.registerPlugin(ScrollTrigger);

export default function BlogArticle() {
  const params = useParams();
  const slug = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<{ id: string; label: string }[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sanitiza el HTML del artículo antes de inyectarlo (defensa contra XSS).
  const cleanHtml = useMemo(
    () => DOMPurify.sanitize(post?.content ?? ""),
    [post],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = slug ? await getPostBySlug(slug) : null;
      if (cancelled) return;
      setPost(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Genera la tabla de contenido a partir de los <h2 id> del contenido.
  useEffect(() => {
    if (!post?.content) return;
    requestAnimationFrame(() => {
      const heads = document.querySelectorAll<HTMLElement>(
        ".article-body h2[id]",
      );
      setTocItems(
        Array.from(heads).map((h) => ({
          id: h.id,
          label: h.textContent ?? "",
        })),
      );
      revealPending(containerRef.current);
    });
  }, [post]);

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
    { scope: containerRef, dependencies: [post] },
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

  if (loading) {
    return (
      <div ref={containerRef}>
        <Header />
        <section className="article-hero container">
          <p style={{ color: "var(--muted-color)" }}>Cargando artículo…</p>
        </section>
      </div>
    );
  }

  if (!post) {
    return (
      <div ref={containerRef}>
        <Header />
        <section
          className="article-hero container"
          style={{ minHeight: "50vh" }}
        >
          <h1>Artículo no encontrado</h1>
          <Link href="/blog" className="cta-btn" style={{ color: "#000" }}>
            ← Volver al blog
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Header />

      {/* Article Hero */}
      <section className="article-hero container">
        <div className="article-hero-meta">
          {post.category && <span className="blog-cat">{post.category}</span>}
          {post.post_date && (
            <span className="blog-date">{post.post_date}</span>
          )}
          {post.read_time && (
            <span className="blog-date">· {post.read_time}</span>
          )}
        </div>
        <h1 className="reveal-up">{post.title}</h1>
      </section>

      {/* Featured Image */}
      {post.img && (
        <div className="article-featured-img container">
          <Image
            src={post.img}
            alt={post.title}
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
      )}

      {/* Article Layout: TOC + Body */}
      <div className="article-layout container">
        {tocItems.length > 0 && (
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
        )}

        <article
          className="article-body reveal-up"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
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
