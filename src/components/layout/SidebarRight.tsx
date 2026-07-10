"use client";
import { useEffect, useRef } from "react";

export default function SidebarRight() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return;
      const pct =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      barRef.current.style.height = `${pct}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside className="sidebar sidebar-right">
      <div className="scroll-progress">
        <div className="scroll-bar" ref={barRef} />
      </div>
    </aside>
  );
}
