import Link from "next/link";

interface CtaSectionProps {
  title: string;
  text: string;
  tag?: string;
  btnText?: string;
  href?: string;
}

export default function CtaSection({
  title,
  text,
  tag = "Hora de decidir",
  btnText = "Agendar auditoría",
  href = "/contacto",
}: CtaSectionProps) {
  return (
    <section className="cta-section">
      <div className="cta-inner container">
        <div className="cta-video-wrap reveal-up">
          <video autoPlay loop muted playsInline>
            <source src="/Video de mujer.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="cta-content">
          <p className="pricing-tag reveal-up">{tag}</p>
          <h2 className="reveal-up">{title}</h2>
          <p className="cta-text reveal-up">{text}</p>
          <div className="hero-cta-group reveal-up">
            <Link href={href} className="cta-btn">
              {btnText}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="btn-icon"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </Link>
            <Link href="/contacto" className="cta-btn cta-btn--ghost">
              Auto Diagnóstico
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="btn-icon"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
