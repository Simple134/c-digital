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
    <section className="cta-section reveal-up">
      <div className="cta-inner container">
        <div className="cta-video-wrap">
          <video autoPlay loop muted playsInline>
            <source src="/Video de mujer.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="cta-content">
          <p className="pricing-tag">{tag}</p>
          <h2>{title}</h2>
          <p className="cta-text">{text}</p>
          <Link href={href} className="cta-btn">
            {btnText}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
