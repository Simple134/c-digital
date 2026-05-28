import ProyectoLayout from "@/components/ui/ProyectoLayout";

export default function ProyectoWeb() {
  return (
    <ProyectoLayout
      category="Web Design / UX"
      title="Gestiono Marketplace"
      publishedDate="Abril 2026"
      country="Rep. Dominicana"
      industry="SaaS / Tech"
      service="UI/UX Design"
      heroImg="/proyectos/web/Portada.jpg"
      overviewSubtitle="El Objetivo"
      overviewText="Diseñar una landing page de alto impacto que funcione como el punto de entrada a la digitalización para las MiPymes dominicanas. La plataforma fue concebida para validar y comunicar la necesidad de un modelo de ventas automatizado, presentando una solución integral que fusiona catálogos web independientes con un potente ecosistema de marketplace nacional, gestión de inventario y facturación centralizada."
      servicesList={[
        "Arquitectura de Información",
        "Diseño de Interfaz de Usuario (UI)",
        "Animación y motion graphics",
        "Diseño de personajes",
      ]}
      conceptWord="PLATFORM"
      conceptTitle="Concepto de interfaz"
      conceptText="La interfaz de Gestiono Market fue diseñada bajo un concepto de «minimalismo operativo», transformando la complejidad de un ERP en una experiencia intuitiva y de alta conversión para el empresario dominicano. A través de una arquitectura de información limpia y una estética SaaS de confianza, la plataforma proyecta un ecosistema unificado donde la gestión de inventario, la facturación y la venta en un marketplace nacional convergen sin fricciones."
      galleryImg1="/proyectos/web/Digitalizar el negocio.png"
      galleryWord1="DIGITAL"
      challengeText="Consolidar las necesidades operativas de las pymes en una experiencia web diseñada para la conversión. El reto principal fue crear una herramienta híbrida: lo suficientemente potente para respaldar una presentación de ventas presencial y lo suficientemente intuitiva para convertir de forma autónoma. Todo esto bajo una estética disruptiva que se aleja de lo convencional para captar la atención del empresario moderno."
      galleryImg2="/proyectos/web/Ecosistema Digital.png"
      galleryWord2="INTERFACE"
      resultText="Es una landing page de alto rendimiento, vinculada orgánicamente a los sistemas de gestión y diseñada bajo una arquitectura de persuasión que responde a los puntos de dolor del empresario actual. Más que una web, es una herramienta de conversión autónoma que forma parte de una iniciativa mayor: concienciar al sector sobre la urgencia de la transformación digital para optimizar el ciclo de ventas."
      carouselImages={[
        "/proyectos/web/Portada.jpg",
        "/proyectos/web/Digitalizar el negocio.png",
        "/proyectos/web/Ecosistema Digital.png",
        "/proyectos/web/Screenshot 2026-05-08 at 10.29.46 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.05.53 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.10.19 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.10.35 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.10.57 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.11.08 PM.png",
        "/proyectos/web/Screenshot 2026-05-08 at 11.11.42 PM.png",
      ]}
      nextProject={{
        href: "/trabajos/app",
        title: "Brigada de Rescate Web App",
        subtitle: "Mobile App",
      }}
    />
  );
}
