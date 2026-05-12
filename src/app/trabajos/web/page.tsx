import ProyectoLayout from "@/components/ui/ProyectoLayout";
export default function ProyectoWeb() {
  return <ProyectoLayout
    category="Web Design / UX" title="Gestiono Marketplace" year="2025"
    heroImg="/proyectos/portada-web.jpg"
    description="Gestiono necesitaba un marketplace que conectara proveedores de servicios con empresas de manera eficiente. Diseñamos y desarrollamos la plataforma completa desde la estrategia UX hasta el código."
    challenge="Múltiples tipos de usuario (proveedores, clientes, administradores) con flujos completamente distintos, todos en la misma plataforma."
    solution="Arquitectura de información clara con dashboards diferenciados por rol, sistema de búsqueda avanzada y proceso de onboarding optimizado para conversión."
    images={["/proyectos/portada-web.jpg"]}
    tags={["Web Design","UX/UI","Next.js","Plataforma digital"]}
    nextProject={{ href: "/trabajos/app", title: "Brigada de Rescate" }}
  />;
}
