import { Grid, Container } from "@bitnation-dev/components";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <Container>
        <div className="flex w-full h-[1px] bg-white mb-4"></div>
        <div className="flex flex-col space-y-4 ">
            <span className="text-2xl font-bold">C Digital</span>
            <span className="text-md">Somos un estudio de diseño especializado <br /> en soluciones digitales para empresas. <strong>Si <br /> buscas crecer necesitas C Digital.</strong></span>
            <span className="text-md bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text w-fit">© 2025 C Digital - Bitnation Limited LLC</span>
        </div>

      </Container>
    </footer>
  );
};

export default Footer;