import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";
export const metadata: Metadata = {
  title: "C Digital",
  description: "C Digital",
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
