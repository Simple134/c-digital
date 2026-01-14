"use client";
import React from "react";
import {
  Globe,
  Palette,
  Monitor,
  BarChart3,
  Search,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const LinksPage = () => {
  const stats = [
    { value: "12+", label: "Años de Experiencia" },
    { value: "100+", label: "Proyectos" },
    { value: "95%", label: "Satisfacción" },
  ];

  const handleLinkClick = (linkTitle: string) => {
    console.log("Click en:", linkTitle);
  };

  return (
    <div className="text-white min-h-screen font-sans relative overflow-x-hidden">
      <div className="relative max-w-[680px] mx-auto px-5 py-16 pb-24 z-10">
        {/* Stats */}
        <div className="flex items-center justify-center mb-12">
          <p className="text-gray-400 text-center">
            Agencia de Marketing y Diseño especialiazda en <br /> Digitalizar
            Negocios
          </p>
        </div>
        <div
          className="grid grid-cols-3 gap-[15px] mb-12"
          style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:-translate-y-[5px]"
            >
              <span className="block text-[28px] font-bold text-[#00FF7C] mb-1">
                {stat.value}
              </span>
              <span className="block text-[13px] text-gray-400 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Links */}
        <h2 className="text-sm text-center font-semibold text-gray-400 uppercase tracking-[0.1em] mt-10 mb-5 px-1">
          Principal
        </h2>
        <div
          className="flex flex-col gap-[15px] mb-8"
          style={{ animation: "fadeInUp 0.8s ease-out 0.3s both" }}
        >
          <a
            href="http://estudiocdigital.com/contacto"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Brief de Auditoría")}
            className="group rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:translate-x-2 relative overflow-hidden bg-gradient-to-br from-[#00d9ff]/10 to-[#00d9ff]/5 border border-[#00FF7C]"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] rounded-[10px] flex items-center justify-center bg-[#00FF7C] text-black">
              <Globe size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Brief de Auditoría
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Solicita una auditoría digital completa para tu negocio
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>
        </div>

        {/* Questions Links */}
        <h2 className="text-sm text-center font-semibold text-gray-400 uppercase tracking-[0.1em] mt-10 mb-5 px-1">
          Preguntas y Dudas
        </h2>
        <div
          className="flex flex-col gap-[15px] mb-8"
          style={{ animation: "fadeInUp 0.8s ease-out 0.4s both" }}
        >
          <a
            href="https://www.estudiocdigital.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("WhatsApp de Asistente")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <Globe size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Visita Nuestro Sitio Web
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Descubre todos nuestros servicios y portafolio completo
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>

          <a
            href="https://wa.me/17867557025"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("WhatsApp de Asistente")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center">
              <Phone size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                WhatsApp de Asistente
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Chatea con nosotros para resolver tus dudas al instante
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>

          {/* <a
            href="https://calendly.com/marketing-agency-rd/consultoria-cdigital"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Agenda una Consultoría")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <Calendar size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Agenda una Consultoría
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Reserva una llamada gratuita con nuestro equipo
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a> */}
        </div>

        {/* Social Media */}
        <h2 className="text-sm text-center font-semibold text-gray-400 uppercase tracking-[0.1em] mt-10 mb-5 px-1">
          Síguenos en Redes
        </h2>
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-8"
          style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}
        >
          {/* YouTube */}
          <a
            href="https://www.youtube.com/@UXCarlos_DR"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("YouTube")}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:-translate-y-[5px] group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* YouTube Logo SVG */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#FF0000"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  fill="#FF0000"
                />
                <path
                  d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold">YouTube</span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/cdigitalestudio"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Instagram")}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:-translate-y-[5px] group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* Instagram Logo SVG (Gradient) */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="instagramGradient"
                    x1="2"
                    y1="22"
                    x2="22"
                    y2="2"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ffc107" />
                    <stop offset="50%" stopColor="#f44336" />
                    <stop offset="100%" stopColor="#9c27b0" />
                  </linearGradient>
                </defs>
                <path
                  d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7Z"
                  stroke="url(#instagramGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7616 8.09206 10.91 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.5226 8.09238 14.352 8.51473 14.9922 9.18784C15.6324 9.86095 16.0375 10.7369 16.13 11.63L16 11.37Z"
                  stroke="url(#instagramGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.5 6.5H17.51"
                  stroke="url(#instagramGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold">Instagram</span>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@ux.carlos.dr"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("TikTok")}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:-translate-y-[5px] group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* TikTok Logo SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">TikTok</span>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/c-digital-estudio/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("LinkedIn")}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:-translate-y-[5px] group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* LinkedIn Logo SVG */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#0077B5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
            <span className="text-sm font-semibold">LinkedIn</span>
          </a>
          {/* X (Twitter) */}
          <a
            href="https://x.com/CarlosDiaz_rd"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("X (Twitter)")}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:-translate-y-[5px] group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* X Logo SVG (White) */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">X (Twitter)</span>
          </a>
        </div>

        {/* Services */}
        <h2 className="text-sm text-center font-semibold text-gray-400 uppercase tracking-[0.1em] mt-10 mb-5 px-1">
          Servicios Destacados
        </h2>
        <div
          className="flex flex-col gap-[15px] mb-8"
          style={{ animation: "fadeInUp 0.8s ease-out 0.6s both" }}
        >
          {/* Branding */}
          <a
            href="http://estudiocdigital.com/servicios#branding"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Diseño de Marca")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <Palette size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Diseño de Marca
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Branding profesional y diseño de identidad corporativa
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>

          {/* Web Development */}
          <a
            href="http://estudiocdigital.com/servicios#desarrollo-web"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Desarrollo Web")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <Monitor size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Desarrollo Web
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Sitios web corporativos, tiendas online y sistemas
                personalizados
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>

          {/* Marketing Digital */}
          <a
            href="http://estudiocdigital.com/servicios#marketing-digital"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Marketing Digital")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <BarChart3 size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Marketing Digital
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Gestión de redes sociales y publicidad digital
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>

          {/* SEO */}
          <a
            href="http://estudiocdigital.com/servicios#posicionamiento-seo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick("Posicionamiento SEO")}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 px-6 flex items-center gap-4 transition-all duration-300 hover:border-[#00d9ff] hover:bg-[#00d9ff]/5 hover:translate-x-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#00d9ff] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="w-12 h-12 min-w-[48px] bg-gray-800 rounded-[10px] flex items-center justify-center text-white">
              <Search size={24} />
            </div>

            <div className="flex-1">
              <span className="block text-base font-semibold mb-1">
                Posicionamiento SEO
              </span>
              <span className="block text-[13px] text-gray-400 leading-[1.4]">
                Aparece primero en Google y aumenta tu visibilidad
              </span>
            </div>

            <span className="text-[#00d9ff] text-xl opacity-0 -translate-x-[10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </a>
        </div>

        {/* Contact Section */}
        <div
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 mt-10"
          style={{ animation: "fadeInUp 0.8s ease-out 0.7s both" }}
        >
          <h3 className="text-xl font-bold text-center mb-6">
            Información de Contacto
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 min-w-[40px] bg-gray-800 rounded-lg flex items-center justify-center text-[#00FF7C]">
                <Mail size={20} />
              </div>
              <a
                href="mailto:hola@estudiocdigital.com"
                className="text-white hover:text-[#00d9ff] transition-colors"
              >
                hola@estudiocdigital.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 min-w-[40px] bg-gray-800 rounded-lg flex items-center justify-center text-[#00FF7C]">
                <Phone size={20} />
              </div>
              <a
                href="tel:+17867557025"
                className="text-white hover:text-[#00d9ff] transition-colors"
              >
                +1 (786) 755-7025
              </a>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 min-w-[40px] bg-gray-800 rounded-lg flex items-center justify-center text-[#00FF7C]">
                <MapPin size={20} />
              </div>
              <span className="text-white">
                Concepción La Vega, República Dominicana
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="text-center mt-16 pt-8 border-t border-[#1a1a1a] text-gray-400 text-sm"
          style={{ animation: "fadeIn 1s ease-out 0.8s both" }}
        >
          <p>© 2025 C Digital. Todos los derechos reservados.</p>
          <p className="mt-2 text-xs">
            Diseñando tus sueños para construir tu realidad.
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default LinksPage;
