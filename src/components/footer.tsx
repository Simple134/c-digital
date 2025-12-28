"use client";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Contacto", href: "/contacto" },
  ],
  services: [
    { name: "Marketing Digital", href: "/servicios#marketing-digital" },
    { name: "Posicionamiento SEO", href: "/servicios#posicionamiento-seo" },
    { name: "Desarrollo Web", href: "/servicios#desarrollo-web" },
    { name: "Diseño de aplicaciones", href: "/servicios#diseño-de-aplicaciones" },
    { name: "Branding", href: "/servicios#branding" },
  ],
};

const Footer = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <footer className="bg-black py-16 relative">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col space-y-6">
            <button onClick={handleClick} className="w-fit">
              <Image src="/Layer_1.png" alt="C Digital" width={120} height={120} className="w-auto h-12" />
            </button>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Diseñando tus sueños para construir tu realidad. Más de 12 años transformando la arquitectura en República Dominicana.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/cdigitalestudio/" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/CDigitalEstudio?ref=1&_rdc=1&_rdr#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@cdigitalestudio/videos" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="ml-12">
            <h3 className="text-white font-semibold text-lg mb-6">Navegación</h3>
            <ul className="space-y-4">
              {navigation.main.map((item) => (
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

          {/* Services Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Servicios</h3>
            <ul className="space-y-4">
              {navigation.services.map((item) => (
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

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+17867557025" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+1 786-755-7025</span>
                </a>
              </li>
              <li>
                <a href="mailto:hola@estudiocdigital.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  <span>hola@estudiocdigital.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Concepción La Vega<br />República Dominicana</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} C Digital. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="text-gray-500 hover:text-white text-sm transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-gray-500 hover:text-white text-sm transition-colors">
              Términos de Uso
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;