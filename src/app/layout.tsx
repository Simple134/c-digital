import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Script from "next/script";
import Footer from "@/components/footer";
import Background from "@/components/background";
export const metadata: Metadata = {
  title: "Agencia de marketing digital y diseño para pymes en RD",
  description:
    "La mejor agencia de marketing digital y diseño especializada en acompañar desde cero a pymes de Rep. Dom. a posicionar sus negocios y digitalizar sus negocios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NLPZ3SLZ');
          `}
        </Script>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-RYKF36ME89"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RYKF36ME89');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        {/* Noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NLPZ3SLZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Header />
        <Background />
        {children}
        <Footer />
      </body>
    </html>
  );
}
