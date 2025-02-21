"use client"
import { Container } from "@bitnation-dev/components";
import Background from "./components/background";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <Container className="relative">
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
                  Soluciones empresariales innovadoras para potenciar tu negocio; conecta <br /> con nosotros y destaca tu proyecto.
                </motion.p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <button
                  className={`border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
                  style={{
                    borderImage: 'linear-gradient(to right, #00C5FF, #00FF7C) 1',
                  }}
                  onClick={() => router.push("/trabajos-ux/ui")}
                >
                  <span className="font-semibold">Servicios Principales</span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </Container>
      </div>
    </div>
  );
}

