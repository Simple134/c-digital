import { Grid, Container } from "@bitnation-dev/components";
import Image from "next/image";
import { Camara } from "./icons";

const Meeting = () => {
  return (
    <Container className="h-[80vh]">
    <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
      <div className="flex items-start justify-start">
        <Image src="/carlos.png" alt="carlos" width={500} height={500} />
      </div>
      <div className="flex flex-col items-start justify-start space-y-2">
        <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-2xl w-fit">
          Dudas o Preguntas?
        </span>
        <h2 className="text-white text-4xl md:text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
          Hablemos
        </h2>
        <p className="text-white text-xl">
          Tu proyecto solo necesita un estudio de diseño responsable para
          escalar; agenda una llamada ahora y no procrastines.{" "}
          <span className="font-bold">Auditoria gratis.</span>
        </p>
        <div className="pt-8">
          <a
            target="_blank"
            className={`flex items-center justify-center  border-2 border-white px-6 py-2 mt-10 font-['Poppins'] lg:text-2xl text-white hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00C5FF] hover:to-[#00FF7C]`}
            style={{
              borderImage: "linear-gradient(to right, #00C5FF, #00FF7C) 1",
            }}
            href="https://calendly.com/diazc6001-5azn/consultoria-cdigital?month=2025-03"
          >
            <span className="font-semibold">Agendar ahora</span>
            <div className="bg-black rounded-full  ml-4">
              <Camara />
            </div>
          </a>
        </div>
      </div>
    </Grid>
  </Container>
  );
};

export default Meeting;
