"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Background from "@/components/background";

export default function LinktreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("linktree-layout");

    const style = document.createElement("style");
    style.id = "linktree-override-styles";
    style.textContent = `
      body.linktree-layout {
        background-color: #000000 !important;
        color: #ededed !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }
      body.linktree-layout h1,
      body.linktree-layout h2,
      body.linktree-layout h3,
      body.linktree-layout h4,
      body.linktree-layout h5,
      body.linktree-layout h6 {
        text-transform: none !important;
        letter-spacing: normal !important;
      }
      body.linktree-layout section {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      #tsparticles {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #000000;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.classList.remove("linktree-layout");
      document.getElementById("linktree-override-styles")?.remove();
    };
  }, []);

  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Background />
      <div className="relative z-10 flex justify-center pt-4">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/Layer_1.png"
            alt="C Digital"
            className="object-cover w-44 lg:w-64 h-full"
            width={256}
            height={256}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
