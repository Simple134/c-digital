"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CDigitalLogo } from "./LogoSvg";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/servicios", label: "Servicios" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={dark ? "header-dark on-dark" : ""}>
        <Link href="/" className="logo">
          <CDigitalLogo />
        </Link>
        <nav className="main-nav">
          <ul>
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={isActive(href) ? "active" : ""}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className={`nav-toggle${open ? " is-open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          <span />
          <span />
        </button>
      </header>

      <nav
        className={`mobile-nav-overlay${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <ul>
          {NAV.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={isActive(href) ? "active" : ""}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-nav-social">
          <a
            href="https://www.instagram.com/cdigitalestudio/"
            target="_blank"
            rel="noopener"
          >
            Instagram
          </a>
          <a
            href="https://www.youtube.com/@cdigitalestudio"
            target="_blank"
            rel="noopener"
          >
            YouTube
          </a>
          <a
            href="https://www.linkedin.com/company/c-digital-estudio/"
            target="_blank"
            rel="noopener"
          >
            LinkedIn
          </a>
        </div>
      </nav>
    </>
  );
}
