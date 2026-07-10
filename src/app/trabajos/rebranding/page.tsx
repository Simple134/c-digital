import ProyectoLayout from "@/components/ui/ProyectoLayout";

export default function ProyectoRebranding() {
  return (
    <ProyectoLayout
      category="Rebranding"
      title="Alas de Larimar"
      publishedDate="Abril 2026"
      country="Rep. Dominicana"
      industry="Joyería"
      service="Rebranding"
      heroImg="/proyectos/rebranding/photoshop file.jpg"
      overviewSubtitle="El Objetivo"
      overviewText="Una joyería de larimar y ámbar con piezas únicas tenía un problema de percepción: sus productos eran hermosos pero no se veían premium. Fotografías sobre césped, fondos que restaban elegancia y un proceso de ventas fragmentado — precios dispersos, imágenes enviadas una por una, disponibilidad validada a mano. El objetivo fue claro: proyectar lujo y simplificar radicalmente la experiencia de compra."
      servicesList={[
        "Fotografía de Producto",
        "Digitalización de Productos",
        "Diseño de Website / E-commerce",
        "Embudo de Venta",
        "Campaña de Marketing",
      ]}
      conceptWord="LUXURY"
      conceptTitle="Lenguaje de marca"
      conceptText="El larimar y el ámbar son piedras raras y únicas del Caribe. El nuevo lenguaje visual tenía que estar a la altura: fondos neutros, luz trabajada, composición cuidada. Cada foto debía comunicar exclusividad antes de que el cliente leyera el precio."
      galleryImg1="/proyectos/rebranding/DSC00314.jpg"
      galleryWord1="BRAND"
      challengeText="El proceso de venta era un laberinto: la clienta enviaba precios dispersos por WhatsApp, mandaba fotos una por una, validaba disponibilidad en el momento. Cada venta dependía completamente de ella. El desafío era convertir ese caos en un sistema autónomo sin perder el trato personalizado que sus clientes valoraban."
      galleryImg2="/proyectos/rebranding/Cuenta antes.jpg"
      galleryWord2="COMMERCE"
      resultText="Construimos un e-commerce vinculado a su sistema de facturación e integrado a un CRM. Ahora sus clientes navegan el catálogo en tiempo real, hacen su compra directamente en la web, y el único mensaje que recibe la dueña en WhatsApp es para revisar el pago y coordinar el envío. La joyería proyecta lujo, vende sola."
      carouselImages={[
        "/proyectos/rebranding/photoshop file.jpg",
        "/proyectos/rebranding/DSC00314.jpg",
        "/proyectos/rebranding/DSC00205.jpg",
        "/proyectos/rebranding/DSC00320.jpg",
        "/proyectos/rebranding/DSC00400.jpg",
        "/proyectos/rebranding/DSC00439.jpg",
        "/proyectos/rebranding/COL-AQU092-V2.jpg",
        "/proyectos/rebranding/COL-AVE016-V3.jpg",
        "/proyectos/rebranding/COL-MIX004-V1.jpg",
        "/proyectos/rebranding/Scree 1.jpg",
        "/proyectos/rebranding/Gemini_Generated_Image_f8p5kaf8p5kaf8p5.png",
      ]}
      projectUrl="https://alasdelarimar.com/"
      nextProject={{
        href: "/trabajos/seo",
        title: "Posicionamiento SEO",
        subtitle: "Marketing Digital",
      }}
    />
  );
}
