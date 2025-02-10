"use client"
import { Container } from "@bitnation-dev/components";
import Header from "./components/header";
import Background from "./components/background";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const handleHeaderClick = (openState: boolean) => {
    setIsOpen(openState);

    // Animación de desplazamiento
    if (openState) {
      // Usar setTimeout para asegurar que el estado se actualice antes del scroll
      setTimeout(() => {
        const scrollTarget = window.innerHeight * 0.8;
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }, 100); // Pequeño retraso para permitir la actualización del estado
    }
  };

  return (
    <div className="relative">
      <Container className={`relative z-10 bg-transparent rounded-2xl ${isOpen ? 'overflow-hidden' : 'overflow-hidden'}`}>
        {!isOpen && <Background />}
        <Header onClick={(openState) => handleHeaderClick(openState)} />
        {
          isOpen ? (
            <div className="flex flex-col items-center justify-center h-[80vh] w-full space-y-8 ">
              <div className="flex flex-col items-center justify-center space-y-4 ">
                <h1 className="text-white text-[90px] font-bold font-['Poppins'] lg:text-9xl">
                  Web en Trabajo
                </h1>
                <p className="text-white w-[80%] text-center font-['Poppins'] lg:text-xl">
                  Contáctanos en <span className="text-[#01aaa8]">Nuestras Redes</span>
                </p>
                <div className="flex gap-8 ">
                  <Image 
                    src="/whatsapp.png" 
                    alt="WhatsApp" 
                    width={50} 
                    height={50} 
                    onClick={() => window.open(`https://wa.me/17867557025`, '_blank')}
                    className="cursor-pointer"
                  />
                  <Image 
                    src="/instagram.png" 
                    alt="Instagram" 
                    width={50} 
                    height={50} 
                    onClick={() => window.open('https://instagram.com/cdigitalestudio', '_blank')}
                    className="cursor-pointer"
                  />
                  <Image 
                    src="/youtube.png" 
                    alt="YouTube" 
                    width={50} 
                    height={50} 
                    onClick={() => window.open('https://www.youtube.com/@UXCarlos_DR/videos', '_blank')}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex flex-col items-center justify-center h-[80vh] w-full space-y-8 ">
                <div className="h-[3px] bg-[#01aaa8] w-64 mb-10 rounded-full lg:block hidden"></div>
                <div className="flex flex-col items-center justify-center space-y-4 ">
                  <h1 className="text-white text-[80px] font-bold font-['Poppins'] lg:text-9xl">
                    Estudio de Diseño
                  </h1>
                  <p className="text-white w-[80%] text-center font-['Poppins'] lg:text-xl">
                    Soluciones empresariales innovadoras para potenciar tu negocio; conecta <br /> con nosotros y destaca tu proyecto.
                  </p>
                </div>
                <div>
                  <button className="border border-white px-6 py-2 mt-10 text-white font-['Poppins'] lg:text-2xl" onClick={() => handleHeaderClick(true)}>
                    <span className="text-[#01aaa8] font-bold">Soluciones Digitales</span>
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </Container>
    </div>
  );
}

