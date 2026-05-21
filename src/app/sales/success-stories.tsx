import { Header } from "@/components/headerBitnation";
import { Container, Grid } from "@bitnation-dev/components";

const projects = [
  {
    title: "Gestiono",
    description:
      "SaaS para la administración integral de pequeños y medianos negocios, utilizando IA para asistencia y reportes.",
    image: "/recent/gestiono.png",
  },
  {
    title: "Eny Express",
    description:
      "Aplicación de optimización de rutas con inteligencia artificial para un sistema de paquetería (Currier) B2B.",
    image: "/recent/eny.png",
  },
  {
    title: "Presto",
    description:
      "Aplicación móvil para la gestión y manejo de préstamos personales, con capacidad de cobros automáticos por WhatsApp.",
    image: "/recent/presto.png",
  },
];

export const SuccessStories = ({ cta }: { cta?: React.ReactNode }) => {
  return (
    <Container className="backdrop-blur-xl bg-black/30 !py-28">
      <Header className=" text-center">Últimos Proyectos Exitosos</Header>
      <p className=" text-center mb-10 mt-5 max-w-md mx-auto">
        Contamos con amplia experiencia desarrollando software y aplicativos
        móviles de alta performance
      </p>
      {/* Desktop Grid */}
      <Grid className="!hidden md:!grid" columns={{ xl: 3, md: 1 }}>
        {projects.map((project) => (
          <div
            className="opacity-30 hover:opacity-100 transition-all duration-300"
            key={project.title}
          >
            <img src={project.image} alt={project.title} className="mb-10" />
            <p className="text-center text-xl mb-4 font-bold px-4">
              {project.title}
            </p>
            <p className="text-center px-4">{project.description}</p>
          </div>
        ))}
      </Grid>
      {/* Mobile Snap Scroll */}
      <div className="md:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4">
        <div className="flex gap-6 pb-6">
          {projects.map((project) => (
            <div
              className={
                "flex-none w-[85vw] snap-center transition-all duration-300"
              }
              key={project.title}
            >
              <img
                src={project.image}
                alt={project.title}
                className="mb-6 w-full h-auto"
              />
              <p className="text-center text-xl mb-2 font-bold">
                {project.title}
              </p>
              <p className="text-center text-sm">{project.description}</p>
            </div>
          ))}
          <div className="flex-none w-[85vw]" /> {/* Spacer for end padding */}
        </div>
      </div>
      <div className=" flex justify-center mt-4">{cta}</div>
    </Container>
  );
};
