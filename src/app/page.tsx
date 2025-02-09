import { Container } from "@bitnation-dev/components";
import Header from "./components/header";
import Background from "./components/background";
export default function Home() {
  return (
    <div className="relative h-screen">
      <Background />
      <Container className="relative z-10 h-[99vh] bg-transparent rounded-2xl p-4 no-scrollbar">
        <Header />
        <div className="flex flex-col items-center justify-center h-[88vh] w-full space-y-8">
          <div className="h-[3px] bg-[#01aaa8] w-64 mb-10 rounded-full"></div>
          <div className="flex flex-col items-center justify-center space-y-4 ">
            <h1 className="text-white text-[90px] font-bold font-['Poppins'] lg:text-9xl">
              Estudio de Diseño
            </h1>
            <p className="text-white w-[80%] text-center font-['Poppins'] lg:text-xl">
              Soluciones empresariales innovadoras para potenciar tu negocio; conecta <br /> con nosotros y destaca tu proyecto.
            </p>
          </div>
          <div>
          <button className="border border-white px-6 py-2 mt-10 text-white font-['Poppins'] lg:text-2xl ">
            <span className="text-[#01aaa8] font-bold">Soluciones Digitales</span>
          </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
