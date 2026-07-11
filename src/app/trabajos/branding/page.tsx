import ProyectoLayout from "@/components/ui/ProyectoLayout";

const carouselImages = Array.from(
  { length: 13 },
  (_, i) => `/proyectos/branding/Brand Guide-${i + 1}.jpg`,
);

export default function ProyectoBranding() {
  return (
    <ProyectoLayout
      category="Identidad de Marca"
      title="OSY Excavator"
      publishedDate="Enero 2026"
      country="Rep. Dominicana"
      industry="Construcción"
      service="Branding"
      heroImg="/proyectos/branding/Osy Portada.jpg"
      overviewSubtitle="El Objetivo"
      overviewText="En este proyecto, nos enfocamos en rediseñar un branding que posicionara a OSY Excavator como una empresa líder en el sector de la construcción, con una imagen moderna y profesional."
      servicesList={[
        "Identidad Visual y Logotipo",
        "Estrategia de Comunicación de Marca",
        "Diseño de Material Corporativo",
      ]}
      conceptWord="IDENTITY"
      conceptTitle="Concepto de marca"
      conceptText="Para OSY Excavator, buscamos una imagen que hablara de su propia fuerza. El diseño integra la silueta de una pala de retroexcavadora en un formato de logotipo con fondo; esta estructura no solo refuerza la identidad del sector, sino que es la opción técnica más eficaz para mantener la unidad visual de la marca."
      galleryImg1="/proyectos/branding/Sketch.jpg"
      galleryWord1="CONCEPT"
      challengeText="Proyectar la robustez de un líder en movimiento de tierra sin limitar su potencial en el sector de la construcción general. En un mercado local que suele ser visualmente genérico, el reto consistió en elevar el nivel técnico de la marca para alinearla con la ambición del cliente: ser el referente número uno. Decidimos dejar atrás los íconos literales de maquinaria para encontrar una identidad moderna y versátil; un punto medio estratégico que comunica que, aunque OSY Excavator domina la base de todo proyecto, su capacidad constructiva no tiene límites."
      galleryImg2="/proyectos/branding/Slide 16_9 - 130.jpg"
      galleryWord2="DETAILS"
      resultText="El resultado es una identidad de marca con jerarquía y presencia premium que proyecta la solidez y el alto nivel técnico de la empresa. Al dejar atrás el diseño genérico del sector, logramos que su experiencia real se vea reflejada a primera vista en cada obra e intervención, posicionando a OSY como el referente indiscutible y de máxima autoridad en su mercado."
      carouselImages={carouselImages}
      nextProject={{
        href: "/trabajos/web",
        title: "Gestiono Marketplace",
        subtitle: "Web Design",
      }}
    />
  );
}
