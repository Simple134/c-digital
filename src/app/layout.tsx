import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";


export const metadata: Metadata = {
  title: "C Digital",
  description: "C Digital es una agencia de diseño en República Dominicana que ofrece soluciones digitales completas para empresas que buscan destacar en el mercado. Nos especializamos en diseño gráfico, branding, creación de logos, desarrollo de aplicaciones móviles, diseño web optimizado para SEO y animación para redes sociales. Ayudamos a PYMEs, startups y emprendedores a crecer mediante estrategias visuales innovadoras y contenido impactante. Con creatividad y tecnología, impulsamos marcas hacia el éxito digital. ¡Transforma tu negocio con nosotros!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
