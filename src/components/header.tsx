"use client"
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@bitnation-dev/components";
import Image from "next/image";

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()


    return (
        <Container className="!w-full bg-transparent relative z-[100]">
            <div className="flex justify-between items-center text-white !w-full pt-4 relative z-[100] " >
                <div className="cursor-pointer top-0 left-0 relative z-50" onClick={() => router.push("/")}>
                    <Image src="/Layer_1.png" alt="logo" className="object-cover lg:w-64 w-44 h-full" width={256} height={256} />
                </div>
                <div className=" space-x-8 lg:block hidden relative z-50">
                    <Link href="/" className={` ${pathname === "/" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Inicio</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Servicios</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Blog</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Equipo</Link>
                    <Link href="/contacto" className={` ${pathname === "/contacto" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Contacto</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} `}>Recursos</Link>
                </div>
            </div>
        </Container>
    )
}

export default Header;