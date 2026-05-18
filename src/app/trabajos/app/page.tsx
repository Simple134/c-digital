import ProyectoLayout from "@/components/ui/ProyectoLayout";
export default function ProyectoApp() {
  return <ProyectoLayout
    category="Mobile App / UI" title="Brigada de Rescate Web App" year="2024"
    heroImg="/proyectos/portada-app.jpg"
    description="Brigada de Rescate necesitaba una aplicación web para coordinar operaciones de emergencia en tiempo real. Diseñamos la interfaz y la experiencia de usuario completa."
    challenge="Los usuarios operan en situaciones de alta presión donde cada segundo cuenta. La interfaz debía ser intuitiva y funcionar offline."
    solution="Diseño mobile-first con componentes de acción rápida, mapa en tiempo real, sistema de alertas y modo offline para zonas sin conectividad."
    images={["/proyectos/portada-app.jpg"]}
    tags={["Mobile App","UX/UI","React Native","Tiempo real"]}
    nextProject={{ href: "/trabajos/rebranding", title: "Alas de Larimar" }}
  />;
}
