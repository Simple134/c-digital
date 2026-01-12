"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Container className="!w-full bg-transparent relative z-[100]">
      <div
        className={`flex ${pathname === "/linktree" ? "justify-center" : "justify-between"} items-center text-white !w-full pt-4 relative z-[100]`}
      >
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

        {/* Desktop Navigation */}
        {pathname !== "/linktree" && (
          <div className=" space-x-8 lg:block hidden relative z-50">
            <Link
              href="/"
              className={` ${pathname === "/" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Inicio
            </Link>
            <Link
              href="/servicios"
              className={` ${pathname === "/servicios" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Servicios
            </Link>
            <Link
              href="/construction"
              className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Blog
            </Link>
            <Link
              href="/construction"
              className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Equipo
            </Link>
            <Link
              href="/contacto"
              className={` ${pathname === "/contacto" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Contacto
            </Link>
            <Link
              href="/construction"
              className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}
            >
              Recursos
            </Link>
          </div>
        )}

        {/* Hamburger Menu Button - Mobile Only */}
        {pathname !== "/linktree" && (
          <button
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
        )}

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 h-screen w-64 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out z-40 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <nav className="flex flex-col gap-6 pt-24 px-8">
            <Link
              href="/"
              className={`text-lg ${pathname === "/" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "text-white hover:text-[#9F9F9F]"}`}
              onClick={closeMenu}
            >
              Inicio
            </Link>
            <Link
              href="/servicios"
              className={`text-lg ${pathname === "/servicios" ? "text-[#01aaa8] font-bold" : "text-white hover:text-[#9F9F9F]"}`}
              onClick={closeMenu}
            >
              Servicios
            </Link>
            <Link
              href="/construction"
              className="text-lg text-white hover:text-[#9F9F9F]"
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link
              href="/construction"
              className="text-lg text-white hover:text-[#9F9F9F]"
              onClick={closeMenu}
            >
              Equipo
            </Link>
            <Link
              href="/contacto"
              className={`text-lg ${pathname === "/contacto" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "text-white hover:text-[#9F9F9F]"}`}
              onClick={closeMenu}
            >
              Contacto
            </Link>
            <Link
              href="/construction"
              className="text-lg text-white hover:text-[#9F9F9F]"
              onClick={closeMenu}
            >
              Recursos
            </Link>
          </nav>
        </div>

        {/* Overlay - closes menu when clicked */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={closeMenu}
          ></div>
        )}
      </div>
    </Container>
  );
};

export default Header;
