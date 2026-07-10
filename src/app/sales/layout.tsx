"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import Background from "@/components/background";

function SalesHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Container className="!w-full bg-transparent relative z-[100]">
      <div className="flex justify-between items-center text-white !w-full pt-4 relative z-[100]">
        <div
          className="cursor-pointer top-0 left-0 relative z-50"
          onClick={() => router.push("/")}
        >
          <Image
            src="/Layer_1.png"
            alt="logo"
            className="object-cover lg:w-64 w-44 h-full"
            width={256}
            height={256}
          />
        </div>

        <div className="space-x-8 lg:block hidden relative z-50">
          {[
            { href: "/", label: "Inicio" },
            { href: "/servicios", label: "Servicios" },
            { href: "/blog", label: "Blog" },
            { href: "/construction", label: "Equipo" },
            { href: "/contacto", label: "Contacto" },
            { href: "/construction", label: "Recursos" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={
                pathname === href
                  ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold"
                  : "hover:text-[#9F9F9F] font-normal"
              }
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          className="lg:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>

        <div
          className={`fixed top-0 right-0 h-screen w-64 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out z-40 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <nav className="flex flex-col gap-6 pt-24 px-8">
            {[
              { href: "/", label: "Inicio" },
              { href: "/servicios", label: "Servicios" },
              { href: "/blog", label: "Blog" },
              { href: "/construction", label: "Equipo" },
              { href: "/contacto", label: "Contacto" },
              { href: "/construction", label: "Recursos" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`text-lg ${pathname === href ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "text-white hover:text-[#9F9F9F]"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </Container>
  );
}

function SalesFooter() {
  const router = useRouter();
  const services = [
    { name: "Marketing Digital", href: "/servicios#marketing-digital" },
    { name: "Posicionamiento SEO", href: "/servicios#posicionamiento-seo" },
    { name: "Desarrollo Web", href: "/servicios#desarrollo-web" },
    {
      name: "Diseño de aplicaciones",
      href: "/servicios#diseño-de-aplicaciones",
    },
    { name: "Branding", href: "/servicios#branding" },
  ];

  return (
    <footer className="bg-black py-16 relative">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col space-y-6">
            <button onClick={() => router.push("/")} className="w-fit">
              <Image
                src="/Layer_1.png"
                alt="C Digital"
                width={120}
                height={120}
                className="w-auto h-12"
              />
            </button>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Somos un estudio de diseño especializado en soluciones digitales
              para empresas. Si buscas crecer necesitas C Digital.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/cdigitalestudio/"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/CDigitalEstudio?ref=1&_rdc=1&_rdr#"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@cdigitalestudio/videos"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="lg:ml-12">
            <h3 className="text-white font-semibold text-lg mb-6">
              Navegación
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Servicios", href: "/servicios" },
                { name: "Contacto", href: "/contacto" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Servicios</h3>
            <ul className="space-y-4">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+17867557025"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>+1 786-755-7025</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@estudiocdigital.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>hola@estudiocdigital.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-1" />
                <span>
                  Concepción La Vega
                  <br />
                  República Dominicana
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} C Digital. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Términos de Uso
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("sales-layout");

    const style = document.createElement("style");
    style.id = "sales-override-styles";
    style.textContent = `
      body.sales-layout {
        background-color: #000000 !important;
        color: #ededed !important;
        font-family: Arial, Helvetica, sans-serif !important;
        --slate-800: #1e293b;
        --slate-900: #0f172a;
      }
      body.sales-layout h1,
      body.sales-layout h2,
      body.sales-layout h3,
      body.sales-layout h4,
      body.sales-layout h5,
      body.sales-layout h6 {
        text-transform: none !important;
        letter-spacing: normal !important;
      }
      body.sales-layout section {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      #tsparticles {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #000000;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.classList.remove("sales-layout");
      document.getElementById("sales-override-styles")?.remove();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Background />
      <SalesHeader />
      {children}
      <SalesFooter />
    </div>
  );
}
