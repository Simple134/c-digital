import { Container, Grid } from "@bitnation-dev/components";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camara } from "./icons";
import Link from "next/link";

const Meeting = () => {
  return (
    <Container>
      <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="flex items-start justify-start"
        >
          <Image src="/muñeco.png" alt="carlos" width={500} height={500} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-start justify-center space-y-2"
        >
          <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
            Dudas o Preguntas?
          </span>
          <div className="flex flex-col items-start pt-4">
            <h2 className="text-white text-4xl md:text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
              Hablemos
            </h2>
            <p className="text-white text-xl">
              Tu proyecto solo necesita un equipo responsable para escalar;
              agenda una llamada ahora y no procrastines.{" "}
              <span className="font-bold">Auditoria gratis.</span>
            </p>
          </div>
          <div className="pt-4">
            <Link
              href={"/contacto"}
              className={`border-2 flex items-center gap-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl bg-white text-black`}
            >
              <span className="font-semibold">Contacto</span>
              <div className="bg-black rounded-full  ml-4">
                <Camara />
              </div>
            </Link>
          </div>
        </motion.div>
      </Grid>
    </Container>
  );
};

export default Meeting;
