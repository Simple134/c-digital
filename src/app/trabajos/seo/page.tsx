import ProyectoLayout from "@/components/ui/ProyectoLayout";
export default function ProyectoSeo() {
  return <ProyectoLayout
    category="SEO / Marketing Digital" title="Posicionamiento SEO" year="2025"
    heroImg="/proyectos/portada-seo.jpg"
    description="Vitalia Wellness Space necesitaba aparecer en los primeros resultados de Google para capturar demanda local en el sector de bienestar y salud."
    challenge="Competencia alta de franquicias internacionales con presupuestos masivos. El cliente dependía 100% de referidos sin tráfico orgánico."
    solution="Estrategia SEO local completa: optimización técnica del sitio, contenido optimizado para intent de búsqueda, Google Business Profile y construcción de autoridad local."
    images={["/proyectos/seo/Vitalia_Wellnesspace-FachadaB.jpg"]}
    tags={["SEO","Marketing local","Google Business","Contenido"]}
    nextProject={{ href: "/trabajos/branding", title: "OSY Excavator" }}
  />;
}
