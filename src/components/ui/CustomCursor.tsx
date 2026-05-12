"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX - 14, y: e.clientY - 14, duration: 0.12, ease: "power2.out" });
    };

    const onEnter = () => gsap.to(cursor, { filter: "blur(5px)", duration: 0.4 });
    const onLeave = () => gsap.to(cursor, { filter: "blur(0px)", duration: 0.4 });

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, .portfolio-item, .nav-toggle").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return <div id="custom-cursor" ref={cursorRef} />;
}
