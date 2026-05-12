import ProyectoLayout from "@/components/ui/ProyectoLayout";
export default function ProyectoRebranding() {
  return <ProyectoLayout
    category="Rebranding" title="Alas de Larimar" year="2025"
    heroImg="/proyectos/portada-rebranding.jpg"
    description="Alas de Larimar, empresa de joyería artesanal dominicana, necesitaba renovar su imagen para competir en mercados internacionales sin perder su esencia local."
    challenge="La marca existente era percibida como artesanal pero informal. Necesitaba elevar su imagen a categoría premium sin alienar a su clientela fiel."
    solution="Rebranding completo que conserva la esencia cultural dominicana pero con tratamiento editorial de lujo: nueva tipografía, fotografía de producto y packaging rediseñado."
    images={["/proyectos/portada-rebranding.jpg"]}
    tags={["Rebranding","Packaging","Fotografía","Lujo"]}
    nextProject={{ href: "/trabajos/seo", title: "Posicionamiento SEO" }}
  />;
}
