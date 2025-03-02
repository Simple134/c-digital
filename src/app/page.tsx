"use client";
import { Column, Container, Grid } from "@bitnation-dev/components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import InfiniteLogo from "./components/infiniteLogo";

export default function Home() {
  const [showNewProjects, setShowNewProjects] = useState(false);

  const initialProjects = [
    {
      image: "/trabajos/1.png",
      title: "AutoServicio",
      description: "Sistema de auto servicio para restaurante.",
      location: "Rep. Dom.",
    },
    {
      image: "/trabajos/2.png",
      title: "Eddward",
      description: "App de mensajería Pos muerte.",
      location: "Estados Unidos",
    },
    {
      image: "/trabajos/3.png",
      title: "Cecil Roofing",
      description: "Web de Servicios de Roofing.",
      location: "Estados Unidos",
    },
  ];

  const newProjects = [
    {
      image: "/trabajos/4.png",
      title: "Web de Real State",
      description: "Sistema de Administracion de Inmuebles",
      location: "Internacional",
    },
    {
      image: "/trabajos/5.png",
      title: "App de Tracking",
      description: "Aplicacion de optimizacion de rutas.",
      location: "Rep. Dom.",
    },
    {
      image: "/trabajos/6.png",
      title: "Sistema de Tutorias",
      description: "Website creada para encontrar tutores en Rep. Dom.",
      location: "Rep. Dom.",
    },
  ];

  const handleVerMas = () => {
    setShowNewProjects(!showNewProjects);

    // Desplazarse al elemento con ID "projects"
    const projectsElement = document.getElementById("projects");
    if (projectsElement) {
      projectsElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleMarcasClick = () => {
    const marcasElement = document.getElementById("marcas");
    if (marcasElement) {
      marcasElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleConectaClick = () => {
    const conectaElement = document.getElementById("conecta-1");
    if (conectaElement) {
      conectaElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleCreaClick = () => {
    const creaElement = document.getElementById("crea-2");
    if (creaElement) {
      creaElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleCreceClick = () => {
    const creceElement = document.getElementById("crece-3");
    if (creceElement) {
      creceElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  
  

  const projectVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 1 } },
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.link/h0k461`, "_blank");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <div className="relative min-h-screen ">
      <Container>
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center justify-center h-[85vh] w-full space-y-8"
          >
            <motion.div
              variants={itemVariants}
              className="h-[3px] bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] w-48 lg:w-64 mb-10 rounded-full"
            ></motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <motion.h1
                variants={itemVariants}
                className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl"
              >
                Estudio de Diseño
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="w-[80%] text-center font-['Poppins'] lg:text-xl"
              >
                Soluciones empresariales innovadoras para potenciar tu negocio;
                conecta <br /> con nosotros y destaca tu proyecto.
              </motion.p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-4"
            >
              <button
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              //onClick={() => router.push("")}
              >
                <span className="font-semibold">¿Quienes somos?</span>
              </button>
              <button
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl bg-white text-black`}
              //onClick={() => router.push("/trabajos-ux/ui")}
              >
                <span className="font-semibold">Contactar </span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </Container>
      <div className="h-48"></div>
      <Container className="w-full px-0 mx-0 max-w-none bg-black">
        <div className="w-full h-56 flex justify-center items-center ">
          <div className="h-1 bg-white w-96"></div>
        </div>
        <div className="flex w-full pl-12">
          <div className="w-full">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
              ¿Quienes somos?
            </span>
            <div className="h-40 relative">
              <div className="flex items-center">
                <h1 className="text-white text-4xl md:text-9xl font-bold font-['Poppins']">
                  C Digital
                </h1>
                <div className="h-2 w-2 md:h-4 md:w-4 ml-2 mt-2 md:ml-2 md:mt-16 bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full h-[30vh] flex">
          <div className="w-full h-full flex justify-end items-center  ">
            <p className="text-white text-md md:text-2xl">
              "Somos un estudio de diseño gráfico y diseño web <br />
              especializado en brindar soluciones digitales a medida para <br />
              empresas en sus diferentes etapas. Más que vendedores de <br />
              servicios de diseño, somos asesores que te ayudarán a resolver{" "}
              <br />
              problemas y alcanzar tus objetivos. Contamos con un equipo de{" "}
              <br />
              expertos en marketing digital y desarrollo web para ofrecerte un{" "}
              <br />
              servicio integral y de alta calidad."
            </p>
          </div>
        </div>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-1">
        <AnimatePresence mode="wait">
          <Grid
            key={showNewProjects ? "new-projects" : "initial-projects"}
            columns={{ xl: 3, lg: 3, md: 1, sm: 1 }}
            className="!m-0 !p-0"
            behavior="media"
            id="projects"
          >
            {(showNewProjects ? newProjects : initialProjects).map(
              (project) => (
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
              )
            )}
          </Grid>
          <motion.div
            className="mt-6 w-full "
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
              <div>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
                  {" "}
                  UX/UI Design
                </span>
                <h1 className="text-white text-[65px] lg:text-[120px] font-bold font-['Poppins'] whitespace-normal leading-[1.1]">
                  Diseño De <br className="leading-[0.3]" /> Productos
                </h1>
              </div>
              <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
                <p className="text-white text-2xl font-['Poppins'] hidden lg:block md:hidden">
                  Creamos Webs y Aplicaciones desde cero; <br /> que generan
                  impacto con diseños a la <br /> vanguardia. Para personas
                  ambiciosas.
                </p>
                <p className="text-white text-2xl font-['Poppins'] block lg:hidden md:hidden">
                  Creamos Webs y Aplicaciones desde cero; que generan impacto
                  con diseños a la vanguardia. Para personas ambiciosas.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleVerMas}
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <button
                    className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                    onClick={handleWhatsAppClick}
                  >
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
            </Grid>
          </motion.div>
        </AnimatePresence>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-2">
        <Grid columns={{ xl: 4, lg: 4, md: 1, sm: 1 }} id="marcas">
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="flex h-full">
              <Image
                src="/trabajos/7.png"
                alt="Project 1"
                width={650}
                height={650}
                className="w-full h-full"
              />
            </div>
          </Column>
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="flex">
              <Image
                src="/trabajos/8.png"
                alt="Project 1"
                width={545}
                height={520}
                className="w-full h-full"
              />
            </div>
          </Column>
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="flex flex-col gap-4">
              <Image
                src="/trabajos/9.png"
                alt="Project 1"
                width={630}
                height={650}
                className="w-full h-full"
              />
              <div className="flex gap-4">
                <Image
                  src="/trabajos/10.png"
                  alt="Project 1"
                  width={200}
                  height={200}
                  priority
                />
                <div className="bg-[#1A1D1F] w-[80%]  flex items-center justify-center">
                  <Image
                    src="/trabajos/12.png"
                    alt="Project 1"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </div>
          </Column>
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="lg:ml-4 w-full">
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
                {" "}
                Branding / Rebranding
              </span>
              <h1 className="text-white lg:text-8xl text-6xl font-bold font-['Poppins'] whitespace-normal leading-[1.1]">
                Diseño De <br className="leading-[0.3]" /> Marcas
              </h1>
              <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
                <p className="text-white text-2xl font-['Poppins'] hidden lg:block md:hidden">
                  Diseñamos marcas que reflejan un <br /> concepto e impulsan
                  estrategias que <br /> venden.
                </p>
                <p className="text-white text-2xl font-['Poppins'] block lg:hidden md:hidden">
                  Diseñamos marcas que reflejan un concepto e impulsan
                  estrategias que venden.
                </p>
                <div className="flex gap-4">
                  <button
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                    onClick={handleMarcasClick}
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <button
                    className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                    onClick={handleWhatsAppClick}
                  >
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
          </Column>
        </Grid>
      </Container>
      <div className="h-64"></div>
      <Container className="pb-12">
        <Grid columns={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
          <div>
            <Image
              src="/support/support1.png"
              alt="Project 1"
              width={650}
              height={650}
              className="w-full h-full"
            />
          </div>
          <div>
            <Image
              src="/support/support2.png"
              alt="Project 1"
              width={650}
              height={650}
              className="w-full h-full"
            />
          </div>
          <div>
            <Image
              src="/support/support3.png"
              alt="Project 1"
              width={650}
              height={650}
              className="w-full h-full"
            />
          </div>
        </Grid>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }} className="!p-0">
          <div className="mt-10 !p-0">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
              {" "}
              Diseño gráfico
            </span>
            <h1 className="text-white text-[65px] lg:text-[120px] font-bold font-['Poppins'] whitespace-normal leading-[0.9] w-fit">
              Content <br className="leading-[0.3]" /> Support
            </h1>
          </div>
          <div className="lg:mt-6 h-full justify-center flex flex-col">
            <p className="text-white text-2xl font-['Poppins'] hidden lg:block md:hidden">
              Creamos piezas gráficas para tu proyecto <br /> enfocadas en
              posicionar, captar, educar o <br /> vender a tu cliente ideal.
            </p>
            <p className="text-white text-2xl font-['Poppins'] block lg:hidden md:hidden">
              Creamos piezas gráficas para tu proyecto enfocadas en posicionar,
              captar, educar o vender a tu cliente ideal.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleVerMas}
                className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              >
                <span className="font-semibold text-xl">Ver más</span>
              </button>
              <button
                className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                onClick={handleWhatsAppClick}
              >
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
        </Grid>
      </Container>
      <div className="h-64"></div>
      <Container className="bg-white h-[65vh]  flex flex-col  ">
        <div className="flex flex-col items-center  ">
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C5FF] to-[#00FF7C]">
            Conoce algunos de
          </p>
          <h1 className="text-black text-6xl font-bold font-['Poppins'] pb-16">
            Nuestros Clientes
          </h1>
          <InfiniteLogo />
        </div>
      </Container>
      <div className="h-48"></div>
      <Container className="h-[100vh] flex ">
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex flex-col justify-center ">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
              Fases y Servicios
            </span>
            <h1 className="text-white text-6xl text-start font-bold font-['Poppins'] lg:text-7xl">
              Problemas Que Resolvemos
            </h1>
          </div>
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col justify-center items-end">
              <span className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer" onClick={handleConectaClick}>
                1. Conecta
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
            <div className="flex flex-col justify-center items-end">
              <span className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer" onClick={handleCreaClick}>
                2. Crea
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
            <div className="flex flex-col justify-center items-end">
              <span className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer" onClick={handleCreceClick}>
                3. Crece
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-48" id="conecta-1"></div>
      <Container className="h-[80vh]" >
        <div className="flex justify-between">
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              1.
            </h1>
          </div>
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Conecta
            </h1>
          </div>
        </div>
        <div className="flex w-full h-[2px] bg-[#AFAFAF] mt-4" ></div>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start mt-8">
            <ul className="text-xl pl-0 space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text ">
                  Naming
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Diseño de identidad visual
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Investigacion de mercado
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Estrategia de marca
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl ">
              En esta fase inicial, definimos la visión de tu negocio, la
              identidad visual de tu <br /> marca y tu buyer persona. Realizamos
              una investigación exhaustiva del <br /> mercado y analizamos a tu
              competencia para identificar oportunidades y <br /> desafíos.
              Establecemos una estrategia de marca sólida que te permita <br />{" "}
              diferenciarte y conectar con tu público objetivo.
            </span>
            <div className=" mt-8">
              <button
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </button>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-64 md:h-48" id="crea-2"></div>
      <Container className="h-[80vh]" >
        <div className="flex justify-between ">
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              2.
            </h1>
          </div>
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Crea
            </h1>
          </div>
        </div>
        <div className="flex w-full h-[2px] bg-[#AFAFAF] mt-4"></div>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start mt-8">
            <ul className="text-xl pl-0 space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text ">
                  Diseño de logos
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Branding
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Diseño de App
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Desarrollo Web
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Diseño UI/UX
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Diseño de empaques
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl ">
              En esta fase, damos vida a tu marca mediante la creación de
              activos visuales <br /> y digitales que transmitan su esencia.
              Diseñamos logos, páginas web atractivas y apps innovadoras,
              empaques creativos y mucho más. Nos aseguramos de que cada
              elemento esté alineado con la narrativa de tu marca y genere un
              impacto positivo en tu audiencia.
            </span>
            <div className=" mt-8">
              <button
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </button>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-64 md:h-48" id="crece-3"></div>
      <Container className="h-[80vh]" >
        <div className="flex justify-between ">
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              3.
            </h1>
          </div>
          <div className="">
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Crece
            </h1>
          </div>
        </div>
        <div className="flex w-full h-[2px] bg-[#AFAFAF] mt-4"></div>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start mt-8">
            <ul className="text-xl pl-0 space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text ">
                  Gestion de redes sociales
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Creacion de contenido
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  SEO
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Campañas de publicidad digital
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl ">
              Impulsamos tu startup con estrategias de marketing digital
              personalizadas. Aumentamos la visibilidad de tu marca y atraemos a
              tu público ideal mediante la gestión de redes sociales, la
              creación de contenido atractivo, la optimización SEO y campañas
              publicitarias efectivas. Nos enfocamos en generar leads
              cualificados y posicionarte en un mercado competitivo.
            </span>
            <div className=" mt-8">
              <button
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </button>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-48"></div>
      <Container className="h-[80vh]">
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start">
            <Image src="/carlos.png" alt="carlos" width={500} height={500} />
          </div>
          <div className="flex flex-col items-start justify-start space-y-2">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
              Dudas o Preguntas?
            </span>
            <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Hablemos
            </h1>
            <p className="text-white text-xl">
              Tu proyecto solo necesita un estudio de diseño responsable para
              escalar; agenda una llamada ahora y no procrastines.{" "}
              <span className="font-bold">Auditoria gratis.</span>
            </p>
            <div className="pt-8">
              <a
                target="_blank"
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
                href="https://calendly.com/diazc6001-5azn/consultoria-cdigital?month=2025-03"
              >
                <span className="font-semibold">Agendar ahora</span>
              </a>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-48"></div>
      <Container className="h-[50vh]">
        <div className="flex flex-col items-center justify-center pb-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
            Follow Our Works
          </span>
        </div>
        <Grid columns={{ xl: 5, lg: 5, md: 1, sm: 1 }}>
          <div className="flex flex-col items-center justify-center">
            <a href="https://www.linkedin.com/company/c-digital-estudio/" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#0B7BD6] hover:cursor-pointer">
              Linkedin
            </a>
          </div>
          <div className="flex flex-col items-center justify-center">
            <a href="https://www.youtube.com/@cdigitalestudio/videos" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#E8003E] hover:cursor-pointer">
              Youtube
            </a>
          </div>
          <div className="flex flex-col items-center justify-center">
            <a href="https://www.instagram.com/cdigitalestudio/" target="_blank" className="text-3xl text-[#AFAFAF] font-bold hover:bg-gradient-to-r hover:from-[#FFB42F] hover:to-[#FA0FB2] hover:text-transparent bg-clip-text hover:cursor-pointer">
              Instagram
            </a>
          </div>
          <div className="flex flex-col items-center justify-center">
            <a href="https://dribbble.com/CDigitalEstudio" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#FF6CCB] hover:cursor-pointer">
              Dribbble
            </a>
          </div>
          <div className="flex flex-col items-center justify-center">
            <a href="https://x.com/CarlosDiaz_rd" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#FFFFFF] hover:cursor-pointer">
              X
            </a>
          </div>
        </Grid>
      </Container>
    </div>
  );
}
