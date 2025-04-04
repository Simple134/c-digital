"use client";
import {  Container } from "@bitnation-dev/components";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <footer className="text-white bg-black relative z-10 ">
      <Container className="bg-black ">
        <div className="flex w-full h-[1px] bg-white mb-8"></div>
        <div className="flex flex-col space-y-4 ">
          <button onClick={handleClick}>
            <Image src="/Layer_1.png" alt="C Digital" width={100} height={100} />
          </button>
            <span className="text-md">Somos un estudio de diseño especializado <br /> en soluciones digitales para empresas. <strong>Si <br /> buscas crecer necesitas C Digital.</strong></span>
            <span className="text-md bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text w-fit">© 2025 C Digital - Bitnation Limited LLC</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;