import ProyectoLayout from "@/components/ui/ProyectoLayout";
export default function ProyectoBranding() {
  return <ProyectoLayout
    category="Branding / Identity" title="OSY Excavator" year="2025"
    heroImg="/proyectos/portada-branding.jpg"
    description="OSY Excavator necesitaba una identidad que transmitiera la fortaleza de su maquinaria y la confiabilidad de su equipo. Construimos una marca desde cero que posicionó a la empresa como líder en su mercado."
    challenge="La empresa carecía de identidad visual y sus materiales eran inconsistentes. Necesitaban una marca que compitiera con jugadores internacionales."
    solution="Desarrollamos un sistema de identidad completo: logo, tipografía, paleta de colores, manual de marca y aplicaciones en vehículos, uniformes y materiales digitales."
    images={["/proyectos/portada-branding.jpg"]}
    tags={["Branding","Identidad visual","Manual de marca","Diseño gráfico"]}
    nextProject={{ href: "/trabajos/web", title: "Gestiono Marketplace" }}
  />;
}
