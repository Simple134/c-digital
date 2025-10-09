"use client";
import { Container, Grid, Column } from "@bitnation-dev/components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import InfiniteLogo from "@/components/infiniteLogo";
import Link from "next/link";
import { RedirectButton } from "@/components/RedirectButton";
import {
  Diseño,
  DiseñoColor,
  Entrega,
  EntregaColor,
  Propuesta,
  PropuestaColor,
  Reunion,
  ReunionColor,
} from "@/components/icons";
import SocialMedia from "@/components/socialMedia";
import Meeting from "@/components/meeting";
import ServiceCheckList from "@/components/ServiceCheckList";

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
  const [selectedProcess, setSelectedProcess] = useState<number | null>(0);

  // Servicios para el componente ServiceCheckList
  const mainServices = [
    { name: "Marketing Digital Estratégico", route: "cont-1" },
    { name: "Diseño de Marca Profesional", route: "cont-2" },
    { name: "Desarrollo Web y Sistemas", route: "cont-1" },
    { name: "Posicionamiento SEO", route: "crece-3" },
    { name: "Digitalización Completa de Negocios", route: "conecta-1" },
  ];

  const brandingServices = [
    { name: "Diseño de Logo", route: "cont-2" },
    { name: "Identidad Corporativa", route: "cont-2" },
    { name: "Manual de Marcas", route: "cont-2" },
    { name: "Papelería Corporativa", route: "cont-2" },
  ];

  const marketingServices = [
    { name: "Gestión de Redes Sociales", route: "cont-1" },
    { name: "Publicidad en Meta ads", route: "cont-2" },
    { name: "Campañas de Google ads", route: "cont-1" },
    { name: "Email Marketing", route: "crece-3" },
    { name: "Content Marketing", route: "conecta-1" },
  ];
  const webSystemsServices = [
    { name: "Pagina Web Corporativa", route: "cont-1" },
    { name: "Tiendas Online (eCommerce)", route: "cont-2" },
    { name: "Sistemas de Gestion", route: "cont-1" },
    { name: "Aplicaciones Web", route: "crece-3" },
  ];
  const seoServices = [
    { name: "Auditoria SEO", route: "cont-1" },
    { name: "SEO Local", route: "cont-2" },
    { name: "SEO Nacional", route: "cont-1" },
    { name: "Optimización Web", route: "crece-3" },
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
    }>
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
    "stagger"
  ) as StaggerVariants;

  const itemVariants = createAnimationVariants("fade", {
    duration: 0.8,
  }) as FadeVariants;

  const marcasVariants = createAnimationVariants(
    "fadeScale"
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

  const processText = [
    {
      title: "Reunión Inicial",
      text: "Nos reunimos contigo para entender tus necesidades, objetivos y expectativas. Analizamos la identidad de tu marca, el público objetivo y los requisitos del proyecto. Además, establecemos un presupuesto y un cronograma preliminar.",
    },
    {
      title: "Propuesta",
      text: "Basándonos en la información recopilada, creamos una propuesta detallada que incluye el alcance del proyecto, tiempos de entrega, costos y metodología de trabajo. Incluimos moodboards, referencias visuales o bocetos iniciales para alinear nuestra visión con la tuya.",
    },
    {
      title: "Diseño y Desarrollo",
      text: "Una vez aprobada la propuesta, nuestro equipo de diseño gráfico y desarrollo web comienza a trabajar en soluciones creativas. Desarrollamos conceptos, bocetos y prototipos, realizando iteraciones y pruebas para garantizar un diseño funcional y atractivo.",
    },
    {
      title: "Presentación y Ajustes",
      text: "Presentamos el diseño final, explicando el proceso creativo y las decisiones detrás de cada elemento. Recibimos tus comentarios y realizamos ajustes o refinamientos hasta lograr un resultado que supere tus expectativas.",
    },
    {
      title: "Entrega y Soporte",
      text: "Una vez aprobado, entregamos el material en los formatos adecuados (archivos digitales, especificaciones técnicas, guías de uso o productos impresos). Además, ofrecemos soporte posterior para asegurar una implementación exitosa.",
    },
  ];

  const handleNext = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    elementId: string
  ) => {
    setter((prev) => (prev + 1) % 4);
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

  const handleWhatsAppClick = () => {
    window.open(`https://wa.link/h0k461`, "_blank");
  };

  // Definir tipos explícitos para cada conjunto de variantes

  const handleProcessClick = (index: number) => {
    setSelectedProcess(index);
  };

  console.log(currentSupportSet);

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
                className="w-[65%] text-center font-['Poppins'] lg:text-xl pt-6"
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
          <div className="md:w-[50%] w-full flex justify-end items-end">
            <p className="text-white text-md md:text-2xl pl-20 md:pl-0 text-left">
              Somos tu agencia integral de marketing digital y diseño que te
              acompaña desde la creación de tu marca hasta el desarrollo de
              sistemas web y estrategias de posicionamiento que generan
              resultados reales.
            </p>
          </div>
        </div>
        {/* Sección de Servicios con checkmarks */}
        <div className="flex w-full mt-6 justify-end items-end">
          <ServiceCheckList back={true} services={mainServices} />
        </div>
        <div className="grid grid-cols-2 w-full mt-6 ">
          <div className="flex flex-col justify-center items-start gap-6 pl-8">
            <h3 className="text-white text-3xl md:text-4xl font-medium font-['Poppins'] leading-tight">
              ¿Tu negocio necesita estar en Digital pero no sabes por dónde
              empezar?
            </h3>
            <p className="text-white text-lg md:text-xl font-['Poppins']">
              En C Digital convertimos negocios tradicionales en empresas
              digitales líderes.
            </p>
            <button
              className="border-2 border-white px-6 py-3 "
              onClick={handleWhatsAppClick}
            >
              <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
                Agenda tu Auditoría
              </span>
            </button>
          </div>
          <div className="flex justify-center items-center">
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
      <Container className="bg-black py-20">
        <div className="flex items-center justify-center">
          {/* Columna derecha - Texto inspiracional */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-3/4 space-y-6 flex flex-col justify-center items-center"
          >
            <div className="w-full h-56 flex justify-end md:justify-center items-end md:items-center ">
              <div className="h-1 bg-white w-48 md:w-96 mb-14"></div>
            </div>
            <span className=" bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-7xl w-fit text-center">
              La Solución Completa para Digitalizar tu Negocio
            </span>
            <span className="text-white text-xl md:text-3xl font-['Poppins'] text-center">
              Agencia de Marketing Digital, Diseño de Marca y Desarrollo Web en
              la Vega, República Dominicana.
            </span>
          </motion.div>
        </div>
      </Container>
      <div className="h-64"></div>
      <Container id="cont-1">
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
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                    onClick={() => handleNext(setCurrentMarcasSet, "marcas")}
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <RedirectButton
                    className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                    whatsappLink={handleWhatsAppClick}
                    service="branding"
                  >
                    <span className="font-semibold text-xl">Hablemos</span>
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
              Diseño gráfico
            </span>
            <h2 className="text-white text-5xl lg:text-8xl font-bold font-['Poppins'] whitespace-normal leading-[1.1] pb-2">
              Marketing Digital
            </h2>
          </div>
          <div className="mt-0 md:mt-6 h-full justify-center flex flex-col ">
            <ServiceCheckList services={marketingServices} />
            <div className="flex gap-4">
              <button
                className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                style={{
                  borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                }}
                onClick={() => handleNext(setSupportSet, "support")}
              >
                <span className="font-semibold text-xl">Ver más</span>
              </button>
              <RedirectButton
                className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                whatsappLink={handleWhatsAppClick}
                service="marketing"
              >
                <span className="font-semibold text-xl">Hablemos</span>
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
                  className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                  style={{
                    borderImage:
                      "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                  }}
                >
                  <span className="font-semibold text-xl">Ver más</span>
                </button>
                <RedirectButton
                  className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                  whatsappLink={handleWhatsAppClick}
                  service="diseño-app"
                >
                  <span className="font-semibold text-xl">Hablemos</span>
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
                Salir Primero<br /> En Redes
              </h2>
              <div className="lg:mt-6 w-full h-full justify-center flex flex-col">
                <div className="flex w-full">
                  <ServiceCheckList services={seoServices} />
                </div>
                <div className="flex gap-4 w-full">
                  <button
                    className={`border-2 border-white w-fit px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #00C5FF, #00FF7C) 1",
                    }}
                    onClick={() => handleNext(setCurrentMarcasSet, "marcas")}
                  >
                    <span className="font-semibold text-xl">Ver más</span>
                  </button>
                  <RedirectButton
                    className="bg-white text-black px-4 py-2 mt-10 font-['Poppins'] lg:text-2xl flex gap-2 items-center"
                    whatsappLink={handleWhatsAppClick}
                    service="branding"
                  >
                    <span className="font-semibold text-xl">Hablemos</span>
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
          <div className="flex flex-col justify-center ">
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
            <span className="text-white text-xl md:text-2xl ">
              En esta fase inicial, definimos la visión de tu negocio, la
              identidad visual de tu marca y tu buyer persona. Realizamos una
              investigación exhaustiva del mercado y analizamos a tu competencia
              para identificar oportunidades y desafíos. Establecemos una
              estrategia de marca sólida que te permita diferenciarte y conectar
              con tu público objetivo.
            </span>
            <div className=" mt-8">
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={handleWhatsAppClick}
              >
                <span className="font-semibold">Necesito Esto +</span>
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
              activos visuales y digitales que transmitan su esencia. Diseñamos
              logos, páginas web atractivas y apps innovadoras, empaques
              creativos y mucho más. Nos aseguramos de que cada elemento esté
              alineado con la narrativa de tu marca y genere un impacto positivo
              en tu audiencia.
            </span>
            <div className=" mt-8">
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={handleWhatsAppClick}
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
              <RedirectButton
                className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                whatsappLink={handleWhatsAppClick}
              >
                <span className="font-semibold">Necesito Esto +</span>
              </RedirectButton>
            </div>
          </div>
        </Grid>
      </Container>
      <div className="h-48"></div>
      <Container className="h-[80vh] ">
        <div className="flex flex-col w-full items-start justify-start md:items-center md:justify-center">
          <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text text-2xl w-fit font-bold">
            ¿Cómo trabajamos?
          </span>
          <h2 className="text-white text-4xl md:text-6xl  font-bold font-['Poppins'] lg:text-9xl">
            Nuestro Proceso
          </h2>
        </div>
        <div className="flex items-center w-full h-[40vh] justify-between px-20 overflow-x-auto">
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={() => handleProcessClick(0)}
          >
            {selectedProcess === 0 ? <ReunionColor /> : <Reunion />}
            <span className="text-white text-xl font-bold">Reunión</span>
          </div>
          <div className="h-16 flex px-4">
            <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={() => handleProcessClick(1)}
          >
            {selectedProcess === 1 ? <PropuestaColor /> : <Propuesta />}
            <span className="text-white text-xl font-bold">Propuesta</span>
          </div>
          <div className="h-16 flex px-4">
            <div className="flex-shrink gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={() => handleProcessClick(2)}
          >
            {selectedProcess === 2 ? <DiseñoColor /> : <Diseño />}
            <span className="text-white text-xl font-bold">Diseño</span>
          </div>
          <div className="h-16 flex px-4">
            <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={() => handleProcessClick(3)}
          >
            {selectedProcess === 3 ? <ReunionColor /> : <Reunion />}
            <span className="text-white text-xl font-bold">Presentacion</span>
          </div>
          <div className="h-16 flex px-4">
            <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={() => handleProcessClick(4)}
          >
            {selectedProcess === 4 ? <EntregaColor /> : <Entrega />}
            <span className="text-white text-xl font-bold">Entrega</span>
          </div>
        </div>
        {selectedProcess !== null && (
          <div className="flex flex-col gap-4 mt-8 w-full">
            <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-3xl w-fit ">
              {processText[selectedProcess].title}
            </span>
            <span className="text-white text-xl w-full md:w-1/2">
              {processText[selectedProcess].text}
            </span>
          </div>
        )}
      </Container>
      <div className="h-48 mt-28 md:mt-0"></div>
      <Meeting />
      <div className="h-48"></div>
      <SocialMedia />
    </div>
  );
}
