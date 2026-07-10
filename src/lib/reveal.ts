import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Revela cualquier elemento .reveal-up que siga oculto (opacity 0) después de
// que el contenido dinámico se cargue desde Supabase. Los elementos que ya
// animó el useGSAP de montaje se ignoran (ya están visibles).
export function revealPending(root?: HTMLElement | null) {
  const scope: ParentNode = root ?? document;
  const els = Array.from(
    scope.querySelectorAll<HTMLElement>(".reveal-up"),
  );
  els.forEach((el) => {
    if (parseFloat(getComputedStyle(el).opacity) > 0.5) return; // ya visible
    const animate = () =>
      gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: "power4.out" });
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      animate();
    } else {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: animate,
      });
    }
  });
  ScrollTrigger.refresh();
}
