"use client";
import { useState } from "react";
import { Column, Container, Grid } from "@bitnation-dev/components";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Trabajos = () => {
  const [showNewProjects, setShowNewProjects] = useState(false);

  const initialProjects = [
    { 
      image: "/trabajos/1.png", 
      title: "AutoServicio", 
      description: "Sistema de auto servicio para restaurante.",
      location: "Rep. Dom."
    },
    { 
      image: "/trabajos/2.png", 
      title: "Eddward", 
      description: "App de mensajería Pos muerte.",
      location: "Estados Unidos"
    },
    { 
      image: "/trabajos/3.png", 
      title: "Cecil Roofing", 
      description: "Web de Servicios de Roofing.",
      location: "Estados Unidos"
    }
  ];

  const newProjects = [
    { 
      image: "/trabajos/4.png", 
      title: "Web de Real State", 
      description: "Sistema de Administracion de Inmuebles",
      location: "Internacional"
    },
    { 
      image: "/trabajos/5.png", 
      title: "App de Tracking", 
      description: "Aplicacion de optimizacion de rutas.",
      location: "Rep. Dom."
    },
    { 
      image: "/trabajos/6.png", 
      title: "Sistema de Tutorias", 
      description: "Website creada para encontrar tutores en Rep. Dom.",
      location: "Rep. Dom."
    }
  ];

  const handleVerMas = () => {
    setShowNewProjects(!showNewProjects);
  };

  const projectVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } }
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.link/h0k461`, '_blank')
}
  return (
    <div className="h-screen overflow-y-auto">
      <Container>
        <AnimatePresence mode="wait">
          <Grid
            key={showNewProjects ? "new-projects" : "initial-projects"}
            columns={{ xl: 3, lg: 3, md: 2 }}
            className="!m-0 !p-0"
            behavior="media"
          >
            {(showNewProjects ? newProjects : initialProjects).map((project, index) => (
              <motion.div
                key={project.image}
                className="relative flex justify-center items-center group"
                style={{ aspectRatio: "16/9" }}
                variants={projectVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Image
                  src={project.image}
                  alt=""
                  width={500}
                  height={500}
                  className="transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end w-[60%] pb-12 px-4 cursor-pointer">
                  <div className="mb-8">
                    <p>
                      <span className="text-white text-2xl font-bold flex h-full">
                        {project.title}:
                        <br />
                      </span>{" "}
                      {project.description}
                    </p>
                  </div>
                  <p className="text-[#00C5FF]">{project.location}</p>
                </div>
              </motion.div>
            ))}
          </Grid>
        </AnimatePresence>
        <div className="grid grid-cols-2 gap-6 w-full">
          <div className="mt-6 w-full">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
              {" "}
              UX/UI Design
            </span>
            <h1 className="text-white text-[120px] font-bold font-['Poppins'] whitespace-normal leading-[1.1]">
              Diseño De <br className="leading-[0.3]" /> Productos
            </h1>
          </div>
          <div className="mt-6 w-full h-full justify-center flex flex-col">
            <p className="text-white text-2xl font-['Poppins']">
              Creamos Webs y Aplicaciones desde cero; <br /> que generan impacto
              con diseños a la <br /> vanguardia. Para personas ambiciosas.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleVerMas}
                className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              >
                <span className="font-semibold text-xl">
                  Ver más
                </span>
              </button>
              <button className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center" onClick={handleWhatsAppClick}>
                <span className="font-semibold text-xl">Hablemos</span>
                <Image
                  src="/whatsapp.png"
                  alt="WhatsApp"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Trabajos;
