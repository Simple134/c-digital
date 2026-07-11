"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import BgGrid from "./BgGrid";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import CustomCursor from "../ui/CustomCursor";

export function EditorialShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname.startsWith("/sales") ||
    pathname.startsWith("/linktree") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/form")
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <BgGrid />
      <CustomCursor />
      <SidebarLeft />
      <SidebarRight />
      <Header dark />
      {children}
      <Footer />
    </>
  );
}
