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
      resultText="El resultado es un sistema automatizado que dio vida a la idea de control de identidad, optimizando drásticamente el tiempo de validación. Transformamos un proceso manual y propenso a errores en una web app robusta con acreditación QR instantánea. Los administradores y auditores ahora ahorran horas de trabajo repetitivo, validando credenciales de forma remota en segundos y recuperando el control de su tiempo operativo desde el primer día."
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
