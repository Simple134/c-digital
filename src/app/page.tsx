"use client";
import { Container, Grid, Column } from "@bitnation-dev/components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import InfiniteLogo from "@/components/infiniteLogo";
import Link from "next/link";
import { RedirectButton } from "@/components/RedirectButton";
import { EmailIcon } from "@/components/icons";
import SocialMedia from "@/components/socialMedia";
import Meeting from "@/components/meeting";
import ServiceCheckList from "@/components/ServiceCheckList";
import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";
import Comotrabajamos from "@/components/Comotrabajamos";

// Define interfaces para los tipos de animaciones
interface AnimationTransition {
  duration?: number;
  ease?: string;
  delay?: number;
  staggerChildren?: number;
}

interface FadeScaleVariants extends Variants {
  initial: { opacity: number; scale: number };
  animate: { opacity: number; scale: number; transition: AnimationTransition };
  exit: { opacity: number; scale: number; transition: AnimationTransition };
}

interface StaggerVariants extends Variants {
  hidden: { opacity: number };
  visible: {
    opacity: number;
    transition: { delayChildren: number; staggerChildren: number };
  };
}

interface FadeVariants extends Variants {
  hidden: { opacity: number; y: number };
  visible: { opacity: number; y: number; transition: AnimationTransition };
}

export default function Home() {
  const [currentProjectSet, setCurrentProjectSet] = useState(0);
  const [currentMarcasSet, setCurrentMarcasSet] = useState(0);
  const [currentSupportSet, setSupportSet] = useState(0);
  const PLACE_ID = process.env.NEXT_PUBLIC_WIDGET_ID;

  // useEffect para obtener usuario de Gestiono
  useEffect(() => {
    const getUserFromGestiono = async () => {
      try {
        console.log("🔄 Obteniendo usuario de Gestiono...");
        const response = await fetch("/api/get-user");
        const data = await response.json();

        if (data.success) {
          console.log("✅ Usuario obtenido de Gestiono:");
          console.log("📊 Datos completos del usuario:", data.user);
          console.log(
            "📋 Estructura JSON:",
            JSON.stringify(data.user, null, 2),
          );
        } else {
          console.error("❌ Error al obtener usuario:", data.error);
        }
      } catch (error) {
        console.error("❌ Error en la petición:", error);
      }
    };

    getUserFromGestiono();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Servicios para el componente ServiceCheckList
  const mainServices = [
    { name: "Marketing Digital Estratégico", route: "" },
    { name: "Diseño de Marca Profesional", route: "" },
    { name: "Desarrollo Web y Sistemas", route: "" },
    { name: "Posicionamiento SEO", route: "" },
    { name: "Digitalización Completa de Negocios", route: "" },
  ];

  const brandingServices = [
    { name: "Diseño de Logo", route: "" },
    { name: "Identidad Corporativa", route: "" },
    { name: "Manual de Marcas", route: "" },
    { name: "Papelería Corporativa", route: "" },
  ];

  const marketingServices = [
    { name: "Gestión de Redes Sociales", route: "" },
    { name: "Publicidad en Meta ads", route: "" },
    { name: "Campañas de Google ads", route: "" },
    { name: "Email Marketing", route: "" },
    { name: "Content Marketing", route: "" },
  ];
  const webSystemsServices = [
    { name: "Pagina Web Corporativa", route: "" },
    { name: "Tiendas Online (eCommerce)", route: "" },
    { name: "Sistemas de Gestion", route: "" },
    { name: "Aplicaciones Web", route: "" },
  ];
  const seoServices = [
    { name: "Auditoria SEO", route: "" },
    { name: "SEO Local", route: "" },
    { name: "SEO Nacional", route: "" },
    { name: "Optimización Web", route: "" },
  ];

  const createAnimationVariants = (
    type: "fade" | "fadeScale" | "stagger",
    options?: Partial<{
      duration: number;
      ease: string;
      delay: number;
      staggerChildren: number;
      scale: number;
      y: number;
    }>,
  ) => {
    const defaults = {
      duration: 1,
      ease: "easeOut",
      delay: 0.5,
      staggerChildren: 0.8,
      scale: 0.8,
      y: 20,
    };

    const config = { ...defaults, ...options };

    if (type === "fadeScale") {
      return {
        initial: { opacity: 0, scale: config.scale },
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: config.duration,
            ease: config.ease,
          },
        },
        exit: {
          opacity: 0,
          scale: config.scale,
          transition: {
            duration: config.duration,
            ease: "easeIn",
          },
        },
      } as FadeScaleVariants;
    } else if (type === "stagger") {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: config.delay,
            staggerChildren: config.staggerChildren,
          },
        },
      } as StaggerVariants;
    } else {
      // Default fade animation
      return {
        hidden: { opacity: 0, y: config.y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: config.duration,
          },
        },
      } as FadeVariants;
    }
  };
  const projectVariants = createAnimationVariants("fadeScale", {
    duration: 1.2,
  }) as FadeScaleVariants;

  const containerVariants = createAnimationVariants(
    "stagger",
  ) as StaggerVariants;

  const itemVariants = createAnimationVariants("fade", {
    duration: 0.8,
  }) as FadeVariants;

  const marcasVariants = createAnimationVariants(
    "fadeScale",
  ) as FadeScaleVariants;

  const firstProjects = [
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

  const secondProjects = [
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

  const thirdProjects = [
    {
      image: "/trabajos/15.png",
      title: "Agendado",
      description: "App de agendas con asistencia de IA.",
      location: "Rep. Dom.",
    },
    {
      image: "/trabajos/14.png",
      title: "Gestiono",
      description: "Sistema de facturación avanzado con IA.",
      location: "Rep. Dom.",
    },
    {
      image: "/trabajos/13.png",
      title: "Prestapp",
      description: "App de préstamos y control de capital",
      location: "Rep. Dom.",
    },
  ];

  const diseñoDeMarcas1 = [
    {
      image: "/trabajos/7.png",
    },
    {
      image: "/trabajos/8.png",
    },
    {
      image: "/trabajos/9.png",
    },
    {
      image: "/trabajos/10.png",
    },
    {
      image: "/trabajos/12.png",
    },
  ];

  const diseñoDeMarcas2 = [
    {
      image: "/disenoMarcas/mbWise1.png",
    },
    {
      image: "/disenoMarcas/mbWise2.png",
    },
    {
      image: "/disenoMarcas/mbWise3.png",
    },
    {
      image: "/disenoMarcas/mbWiseLogo.png",
    },
    {
      image: "/disenoMarcas/mbWiseColor.png",
    },
  ];

  const diseñoDeMarcas3 = [
    {
      image: "/disenoMarcas/yedoza1.png",
    },
    {
      image: "/disenoMarcas/yedoza2.png",
    },
    {
      image: "/disenoMarcas/yedoza3.png",
    },
    {
      image: "/disenoMarcas/yedozaLogo.png",
    },
    {
      image: "/disenoMarcas/yedoza4.png",
    },
  ];

  const supportImages1 = [
    {
      image: "/support/support11.png",
    },
    {
      image: "/support/support12.png",
    },
    {
      image: "/support/support13.png",
    },
    {
      image: "/support/support14.png",
    },
  ];

  const supportImages2 = [
    {
      image: "/support/support1.png",
    },
    {
      image: "/support/support2.png",
    },
    {
      image: "/support/support3.png",
    },
  ];

  const supportImages3 = [
    {
      image: "/support/support4.png",
    },
    {
      image: "/support/support5.png",
    },
    {
      image: "/support/support6.png",
    },
    {
      image: "/support/support7.png",
    },
  ];

  const supportImages4 = [
    {
      image: "/support/support8.png",
    },
    {
      image: "/support/support9.png",
    },
    {
      image: "/support/support10.png",
    },
  ];

  const handleNext = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    elementId: string,
  ) => {
    setter((prev) => (prev + 1) % 3);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
                className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-8xl"
              >
                Agencia de Marketing Digital y Diseño
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="w-[65%] text-center font-['Avenir'] lg:text-2xl pt-6 font-extrabold"
              >
                La Solución Completa para Digitalizar tu Negocio
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
                onClick={() => handleScrollTo("quienes-somos")}
              >
                <span className="font-semibold text-sm lg:text-xl">
                  ¿Quienes somos?
                </span>
              </button>
              <Link
                href="/contacto"
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl bg-white text-black`}
                //onClick={() => router.push("/trabajos-ux/ui")}
              >
                <span className="font-semibold">Contactar </span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </Container>
      <div className="h-48"></div>
      <Container
        className="w-full px-0 mx-0 max-w-none bg-black"
        id="quienes-somos"
      >
        <div className="w-full h-56 flex justify-end md:justify-center items-end md:items-center ">
          <div className="h-1 bg-white w-48 md:w-96 mb-14"></div>
        </div>
        <div className="flex w-full justify-start items-start ">
          <div className="w-full">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-lg md:text-2xl   ">
              ¿Quienes somos?
            </span>
            <div className="h-40 relative mt-4">
              <Image
                src="/logoCdigital.png"
                alt="logo"
                width={500}
                height={500}
                className="w-[60%] "
              />
            </div>
          </div>
        </div>
        <div className="w-full flex mt-12 justify-end items-end">
          <div className="w-full md:w-[50%]  flex justify-end items-end">
            <p className="text-white text-md md:text-2xl pl-0 text-left font-['Avenir']">
              Somos una agencia de marketing digital y diseño especializada en
              la digitalización de negocio/proyecto. Que te acompaña desde la
              ideación de tu negocio hasta la implementación de estrategias de
              posicionamiento que generan resultados reales.
            </p>
          </div>
        </div>
        {/* Sección de Servicios con checkmarks */}
        <div className="flex w-full mt-6 md:justify-end md:items-end">
          <ServiceCheckList back={true} services={mainServices} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full mt-24 ">
          <div className="flex flex-col justify-center items-start mt-12 md:mt-0 gap-6 pl-8 order-last md:order-first">
            <h3
              style={{
                lineHeight: "1.1",
                fontWeight: "505",
              }}
              className="text-white text-3xl md:text-5xl font-['Avenir'] leading-tight"
            >
              ¿Tu negocio necesita estar en Digital pero no sabes por dónde
              empezar?
            </h3>
            <p className="text-white text-lg md:text-xl font-['Poppins']">
              En C Digital convertimos negocios tradicionales en <br /> empresas
              digitales líderes.
            </p>
            <button
              className="border-2 border-white px-6 py-3 mt-5 "
              onClick={() => {
                window.location.href = "https://wa.me/7867557025";
              }}
            >
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
                Me Interesa Iniciar
              </span>
            </button>
          </div>
          <div className="flex justify-center items-center order-first md:order-last">
            <Image
              src="/sitBW.png"
              alt="logo"
              width={500}
              height={500}
              className="w-[60%] "
            />
          </div>
        </div>
      </Container>
      <div className="h-64"></div>
      <Container className="py-20">
        <div className="flex items-center justify-center">
          {/* Columna derecha - Texto inspiracional */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-3/4 space-y-10 flex flex-col justify-center items-center"
          >
            <div className="w-full h-24 flex justify-center items-center ">
              <div className="h-1 bg-white w-48 md:w-96"></div>
            </div>
            <span className=" bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-7xl w-fit text-center">
              La Solución Completa para Digitalizar tu Negocio
            </span>
          </motion.div>
        </div>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-1">
        <div className="flex flex-col lg:mb-20 mb-12">
          <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit text-center">
            Servicios Destacados
          </span>
          <span className="text-white font-bold text-5xl md:text-7xl font-['Poppins']">
            Somos Especialistas En
          </span>
        </div>
        <Grid columns={{ xl: 4, lg: 4, md: 1, sm: 1 }} id="marcas">
          <AnimatePresence mode="wait">
            {currentMarcasSet === 0 && (
              <>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full"
                    key="marca1-1"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas1[0].image}
                      alt="Project 1"
                      width={700}
                      height={700}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full"
                    key="marca1-2"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas1[1].image}
                      alt="Project 1"
                      width={700}
                      height={700}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex flex-col gap-4 h-full"
                    key="marca1-3"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas1[2].image}
                      alt="Project 1"
                      width={700}
                      height={700}
                      className="w-full h-full object-cover"
                    />
                    <div className="flex gap-4">
                      <Image
                        src={diseñoDeMarcas1[3].image}
                        alt="Project 1"
                        width={200}
                        height={200}
                        priority
                        className="object-cover"
                      />
                      <div className="bg-[#1A1D1F] w-[80%] flex items-center justify-center">
                        <Image
                          src={diseñoDeMarcas1[4].image}
                          alt="Project 1"
                          width={100}
                          height={100}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Column>
              </>
            )}

            {currentMarcasSet === 1 && (
              <>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full w-full"
                    key="marca2-1"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas2[0].image}
                      alt="Project 1"
                      fill
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full"
                    key="marca2-2"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas2[1].image}
                      alt="Project 1"
                      width={700}
                      height={700}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex flex-col gap-4 h-full"
                    key="marca2-3"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="w-full h-full">
                      <Image
                        src={diseñoDeMarcas2[2].image}
                        alt="Project 1"
                        width={800}
                        height={800}
                        className=" object-center w-full h-full "
                      />
                    </div>
                    <div className="flex gap-4">
                      <Image
                        src={diseñoDeMarcas2[3].image}
                        alt="Project 1"
                        width={250}
                        height={250}
                        priority
                        className="object-cover"
                      />
                      <div className="flex gap-4">
                        <Image
                          src={diseñoDeMarcas2[4].image}
                          alt="Project 1"
                          width={600}
                          height={600}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Column>
              </>
            )}

            {currentMarcasSet === 2 && (
              <>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full"
                    key="marca3-1"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas3[0].image}
                      alt="Project 1"
                      width={650}
                      height={650}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex h-full"
                    key="marca3-2"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas3[1].image}
                      alt="Project 1"
                      width={545}
                      height={520}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Column>
                <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
                  <motion.div
                    className="flex flex-col gap-4 h-full"
                    key="marca3-3"
                    variants={marcasVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Image
                      src={diseñoDeMarcas3[2].image}
                      alt="Project 1"
                      width={630}
                      height={650}
                      className="w-full h-full object-cover"
                    />
                    <div className="flex gap-4">
                      <Image
                        src={diseñoDeMarcas3[3].image}
                        alt="Project 1"
                        width={200}
                        height={200}
                        priority
                        className="object-cover"
                      />
                      <div className="flex gap-4">
                        <Image
                          src={diseñoDeMarcas3[4].image}
                          alt="Project 1"
                          width={540}
                          height={540}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Column>
              </>
            )}
          </AnimatePresence>

          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="lg:ml-4 w-full">
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
                {" "}
                Branding / Rebranding
              </span>
              <h2 className="text-white text-5xl lg:text-7xl font-bold font-['Poppins'] whitespace-normal leading-[1.1] pb-2 w-96">
                Diseño De Marcas Profesionales
              </h2>
              <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
                <div className="flex w-full">
                  <ServiceCheckList services={brandingServices} />
                </div>
                <div className="flex gap-4 w-full">
                  <button
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                    onClick={() => handleNext(setCurrentMarcasSet, "marcas")}
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <RedirectButton
                    className="bg-white text-black px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl flex gap-2 items-center"
                    whatsappLink={() => {
                      window.location.href = "https://wa.me/7867557025";
                    }}
                    service="branding"
                  >
                    <span className="font-semibold text-xl">
                      Me Interesa Esto
                    </span>
                    <EmailIcon />
                  </RedirectButton>
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </Container>
      <div className="h-64"></div>
      <Container className="pb-12" id="cont-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`support-set-${currentSupportSet}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`hidden md:grid grid-cols-3 gap-4 ${
                currentSupportSet === 0 || currentSupportSet === 2
                  ? "grid-cols-4"
                  : ""
              }`}
            >
              {currentSupportSet === 0 && (
                <>
                  {supportImages1.map((image, index) => (
                    <Column key={`support1-${index}`}>
                      <motion.div
                        variants={marcasVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex h-full relative group"
                      >
                        <Image
                          src={image.image}
                          alt="Project 1"
                          width={650}
                          height={650}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 rounded-lg" />
                      </motion.div>
                    </Column>
                  ))}
                </>
              )}

              {currentSupportSet === 1 && (
                <>
                  {supportImages2.map((image, index) => (
                    <Column key={`support2-${index}`}>
                      <motion.div
                        variants={marcasVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex h-full relative group"
                      >
                        <Image
                          src={image.image}
                          alt="Project 1"
                          width={650}
                          height={650}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 rounded-lg" />
                      </motion.div>
                    </Column>
                  ))}
                </>
              )}

              {currentSupportSet === 2 && (
                <>
                  {supportImages3.map((image, index) => (
                    <Column key={`support3-${index}`}>
                      <motion.div
                        variants={marcasVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex h-full relative group"
                      >
                        <Image
                          src={image.image}
                          alt="Project 1"
                          width={650}
                          height={650}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 rounded-lg" />
                      </motion.div>
                    </Column>
                  ))}
                </>
              )}
              {currentSupportSet === 3 && (
                <>
                  {supportImages4.map((image, index) => (
                    <Column key={`support4-${index}`}>
                      <motion.div
                        variants={marcasVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex h-full relative group"
                      >
                        <Image
                          src={image.image}
                          alt="Project 1"
                          width={650}
                          height={650}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 rounded-lg" />
                      </motion.div>
                    </Column>
                  ))}
                </>
              )}
            </div>

            {/* Versión móvil con scroll horizontal */}
            <div className="md:hidden w-full">
              <div className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x scrollbar-hide">
                {(currentSupportSet === 0
                  ? supportImages1
                  : currentSupportSet === 1
                    ? supportImages2
                    : currentSupportSet === 2
                      ? supportImages3
                      : supportImages4
                ).map((image, index) => (
                  <div
                    key={`support-mobile-${index}`}
                    className="flex-none w-full snap-center"
                  >
                    <motion.div
                      variants={marcasVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="relative group h-[50vh]"
                    >
                      <Image
                        src={image.image}
                        alt="Project 1"
                        width={500}
                        height={500}
                        className="h-full object-contain rounded-lg"
                      />
                      <div className="hidden md:block absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 rounded-lg" />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }} className="!p-0">
          <div className="mt-10 !p-0">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
              {" "}
              Agencia de Marketing
            </span>
            <h2 className="text-white text-5xl lg:text-8xl font-bold font-['Poppins'] whitespace-normal leading-[1.1] pb-2">
              Marketing Digital
            </h2>
          </div>
          <div className="mt-0 md:mt-6 h-full justify-center flex flex-col ">
            <ServiceCheckList services={marketingServices} />
            <div className="flex gap-4">
              <button
                className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
                onClick={() => handleNext(setSupportSet, "support")}
              >
                <span className="font-semibold text-xl">Ver más</span>
              </button>
              <RedirectButton
                className="bg-white text-black px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl flex gap-2 items-center"
                whatsappLink={() => {
                  window.location.href = "https://wa.me/7867557025";
                }}
                service="marketing"
              >
                <span className="font-semibold text-xl">Me Interesa Esto</span>
                <EmailIcon />
              </RedirectButton>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-3">
        <AnimatePresence mode="wait">
          <Grid
            key={`projects-set-${currentProjectSet}`}
            columns={{ xl: 3, lg: 3, md: 1, sm: 1 }}
            className="!m-0 !p-0"
            behavior="media"
            id="projects"
          >
            {(currentProjectSet === 0
              ? firstProjects
              : currentProjectSet === 1
                ? secondProjects
                : thirdProjects
            ).map((project) => (
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
        <div className="mt-6 w-full ">
          <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
            <div>
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
                {" "}
                UX/UI Design
              </span>
              <h2 className="text-white text-5xl lg:text-7xl font-bold font-['Poppins'] whitespace-normal leading-[1.1]">
                Diseño Web <br /> Y Sistemas
              </h2>
            </div>
            <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
              <ServiceCheckList services={webSystemsServices} />
              <div className="flex gap-4">
                <button
                  onClick={() => handleNext(setCurrentProjectSet, "projects")}
                  className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                  style={{
                    borderImage:
                      "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                  }}
                >
                  <span className="font-semibold text-xl">Ver más</span>
                </button>
                <RedirectButton
                  className="bg-white text-black px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl flex gap-2 items-center"
                  whatsappLink={() => {
                    window.location.href = "https://wa.me/7867557025";
                  }}
                  service="diseño-app"
                >
                  <span className="font-semibold text-xl">
                    Me Interesa Esto
                  </span>
                  <EmailIcon />
                </RedirectButton>
              </div>
            </div>
          </Grid>
        </div>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-4">
        <Grid columns={{ xl: 4, lg: 4, md: 1, sm: 1 }} id="redes">
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <motion.div
              className="flex h-full"
              variants={marcasVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Image
                src="/redes/redes1.png"
                alt="Contenido de Redes"
                width={700}
                height={700}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Column>
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <motion.div
              className="flex h-full"
              variants={marcasVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Image
                src="/redes/redes2.png"
                alt="Contenido de Redes"
                width={700}
                height={700}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Column>
          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <motion.div
              className="flex h-full"
              variants={marcasVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Image
                src="/redes/redes3.png"
                alt="Contenido de Redes"
                width={700}
                height={700}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Column>

          <Column columns={{ xl: { width: 2 }, md: { width: 1 } }}>
            <div className="lg:ml-4 w-full">
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl">
                {" "}
                Posicionamiento SEO
              </span>
              <h2 className="w-full text-white text-5xl lg:text-7xl font-bold font-['Poppins'] whitespace-normal leading-[1.1] pb-2">
                Salir Primero
                <br /> En Redes
              </h2>
              <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
                <div className="flex w-full">
                  <ServiceCheckList services={seoServices} />
                </div>
                <div className="flex gap-4 w-full">
                  <button
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                    disabled
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <RedirectButton
                    className="bg-white text-black px-4 py-2 mt-10 font-['Avenir'] font-bold lg:text-2xl flex gap-2 items-center"
                    whatsappLink={() => {
                      window.location.href = "https://wa.me/7867557025";
                    }}
                    service="branding"
                  >
                    <span className="font-semibold text-xl">
                      Me Intersa Esto
                    </span>
                    <EmailIcon />
                  </RedirectButton>
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </Container>
      <div className="h-64"></div>
      <Container className="bg-white h-[65vh] w-full  flex flex-col overflow-hidden !p-0 !m-0  ">
        <div className="flex flex-col items-center  ">
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C5FF] to-[#00FF7C]">
            Conoce algunos de
          </p>
          <h2 className="text-black text-4xl md:text-6xl font-bold font-['Poppins'] pb-16">
            Nuestros Clientes
          </h2>
          <InfiniteLogo />
        </div>
      </Container>
      <div className="h-48"></div>
      <Container className="h-[100vh] flex ">
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex flex-col ">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
              Fases y Servicios
            </span>
            <h2 className="text-white text-5xl text-start font-bold font-['Poppins'] lg:text-7xl">
              Problemas que Resolvemos
            </h2>
            <p className="text-white text-xl lg:text-2xl font-['Poppins'] w-3/4 pt-8">
              Para simplificar el proceso de trabajo hemos creados 3 fases donde
              se agrupan los diferentes servicios.
            </p>
          </div>
          <div className="flex flex-col space-y-6 mt-8 md:mt-0">
            <div className="flex flex-col justify-center items-end">
              <span
                className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer"
                onClick={() => handleScrollTo("conecta-1")}
              >
                1. Conecta
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
            <div className="flex flex-col justify-center items-end">
              <span
                className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer"
                onClick={() => handleScrollTo("crea-2")}
              >
                2. Crea
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
            <div className="flex flex-col justify-center items-end">
              <span
                className="text-[#AFAFAF] hover:text-white text-3xl font-bold font-['Poppins'] hover:cursor-pointer"
                onClick={() => handleScrollTo("crece-3")}
              >
                3. Crece
              </span>
              <div className="bg-[#FFFFFF] w-full h-[1px] mt-2"></div>
            </div>
            <Image
              src="/ilustration.png"
              alt="Process"
              width={1000}
              height={1000}
            />
          </div>
        </Grid>
      </Container>
      <div className="h-48" id="conecta-1"></div>
      <Container className="h-[80vh]">
        <div className="flex justify-between">
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              1.
            </h2>
          </div>
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Conecta
            </h2>
          </div>
        </div>
        <div className="flex w-full h-[2px] bg-[#AFAFAF] mt-4"></div>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start mt-8">
            <ul className="text-xl pl-0 space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text ">
                  Auditoria Digital Completa
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Estrategia de Marketing Digital
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Posicionamiento SEO Local
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Consultoria Estrategica
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl md:text-2xl font-['Avenir']">
              Todo comienza con entender tu negocio y definir cómo te conectarás
              con tus clientes ideales en el ecosistema digital. En esta fase
              desarrollamos la estrategia de marketing digital que impulsará tu
              crecimiento.
            </span>
            <div className=" mt-8">
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={() => {
                  window.location.href = "https://wa.me/7867557025";
                }}
              >
                <span className="font-semibold font-['Avenir']">
                  Necesito Esto +
                </span>
              </RedirectButton>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-64 md:h-48" id="crea-2"></div>
      <Container className="h-[80vh]">
        <div className="flex justify-between ">
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              2.
            </h2>
          </div>
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Crea
            </h2>
          </div>
        </div>
        <div className="flex w-full h-[2px] bg-[#AFAFAF] mt-4"></div>
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex items-start justify-start mt-8">
            <ul className="text-xl pl-0 space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text ">
                  Diseño de Marca Profesional
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Desarrollo Web y Sistemas
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Presencia en Redes Sociales
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  E-commerce (Si necesitas tienda online)
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Sistemas Empresariales
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl ">
              Con la estrategia definida, pasamos a la acción. Creamos todos los
              activos digitales que necesitas: desde tu marca profesional hasta
              tu sitio web y contenido visual. Todo diseñado para vender y
              generar confianza.
            </span>
            <div className=" mt-8">
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={() => {
                  window.location.href = "https://wa.me/7867557025";
                }}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </RedirectButton>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-64 md:h-48" id="crece-3"></div>
      <Container className="h-[80vh]">
        <div className="flex justify-between ">
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              3.
            </h2>
          </div>
          <div className="">
            <h2 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Crece
            </h2>
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
                  Publicidad Digital (Google Ads + Meta Ads)
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Posicionamiento SEO Continuo
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Email Marketing Automatizado
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Analitica y Optimizacion
                </span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] mr-4"></span>
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
                  Produccion de contenido
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start mt-8">
            <span className="text-white text-xl ">
              Una vez lanzado, el verdadero trabajo comienza. Implementamos
              campañas de marketing digital, optimizamos tu posicionamiento en
              Google y gestionamos tu presencia online para que generes leads y
              ventas constantes.
            </span>
            <div className=" mt-8">
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={() => {
                  window.location.href = "https://wa.me/7867557025";
                }}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </RedirectButton>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-48"></div>
      <Comotrabajamos />
      <div className="h-48"></div>
      <div className="bg-white  lg:h-[75vh] w-full flex flex-col text-center overflow-hidden pt-20 !m-0">
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C5FF] to-[#00FF7C]">
          Testimonios Reales
        </p>
        <h2 className="text-black text-4xl md:text-6xl font-bold font-['Poppins'] pb-16">
          Nuestros Clientes
        </h2>
        <ReactGoogleReviews
          layout="carousel"
          featurableId={PLACE_ID as string}
          maxItems={3}
          carouselAutoplay={true}
          carouselSpeed={2500}
          showDots={false}
        />
      </div>
      <div className="h-48 mt-28 md:mt-0"></div>
      <Meeting />
      <div className="h-48"></div>
      <SocialMedia />
    </div>
  );
}
