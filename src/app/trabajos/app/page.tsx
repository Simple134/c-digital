import ProyectoLayout from "@/components/ui/ProyectoLayout";

export default function ProyectoApp() {
  return (
    <ProyectoLayout
      category="Mobile App / UI"
      title="Brigada de Rescate Web App"
      publishedDate="Marzo 2026"
      country="Rep. Dominicana"
      industry="Seguridad"
      service="Web App Design"
      heroImg="/proyectos/app/POrtada de App.jpg"
      overviewSubtitle="El Objetivo"
      overviewText="Desarrollar un ecosistema de registro ágil y una infraestructura de perfiles digitales para los miembros de la brigada. El sistema está diseñado para facilitar la verificación de identidad en tiempo real, permitiendo auditar el estatus actual de cada integrante de forma remota."
      servicesList={[
        "Diseño de Interfaz",
        "Arquitectura de Web",
        "Estrategia de Integración de Sistemas",
      ]}
      conceptWord="Easy"
      conceptTitle="La solicitud"
      conceptText="El requerimiento consistió en desarrollar un sistema de validación de identidad de alta eficiencia y bajo costo operativo. Ante la necesidad de mitigar el uso de credenciales falsas y fortalecer el prestigio institucional, se solicitó una solución basada en códigos QR que permitiera la verificación inmediata de perfiles."
      galleryImg1="/proyectos/app/CellPhone-Screen1.jpg"
      galleryWord1="MOBILE"
      challengeText="El reto principal fue la accesibilidad: crear una herramienta tecnológica robusta, pero diseñada con una curva de aprendizaje mínima para usuarios con competencias digitales básicas y en poco tiempo."
      galleryImg2="/proyectos/app/Laptop.jpg"
      galleryWord2="EXPERIENCE"
      resultText="Desarrollamos una aplicación web estratégica que centraliza la gestión de la brigada mediante un flujo de inscripción controlado. Implementamos un formulario de registro de acceso restringido para filtrar solicitudes no autorizadas, vinculado a un panel de administración robusto. La solución culmina en un sistema de acreditación mediante códigos QR de baja carga de datos, lo que garantiza una lectura instantánea incluso en condiciones de baja conectividad. Para los auditores, el resultado es una herramienta de navegación simplificada que permite validar el estatus de cualquier miembro en segundos con un solo escaneo."
      carouselImages={[
        "/proyectos/app/POrtada de App.jpg",
        "/proyectos/app/Laptop.jpg",
        "/proyectos/app/CellPhone-Screen1.jpg",
        "/proyectos/app/CellPhone-Screen2.jpg",
        "/proyectos/app/CellPhone-Screen3.jpg",
      ]}
      nextProject={{
        href: "/trabajos/rebranding",
        title: "Alas de Larimar",
        subtitle: "Product Design",
      }}
    />
  );
}
