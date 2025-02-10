"use client"
import { Container } from "@bitnation-dev/components";
import Background from "./components/background";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <Container className="relative">
          <div className="flex flex-col items-center justify-center h-[85vh] w-full space-y-8">
            <div className="h-[3px] bg-[#01aaa8] w-64 mb-10 rounded-full lg:block hidden"></div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
                Estudio de Diseño
              </h1>
              <p className="text-white w-[80%] text-center font-['Poppins'] lg:text-xl">
                Soluciones empresariales innovadoras para potenciar tu negocio; conecta <br /> con nosotros y destaca tu proyecto.
              </p>
            </div>
            <div>
              <button className="border border-white px-6 py-2 mt-10 text-white font-['Poppins'] lg:text-2xl" onClick={() => router.push("/construction")}>
                <span className="text-[#01aaa8] font-bold">Soluciones Digitales</span>
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

