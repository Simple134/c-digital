"use client"
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@bitnation-dev/components";

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()

    return (
        <Container className="!w-full bg-transparent relative z-50">
            <div className="flex justify-between items-center text-white !w-full pt-4 relative z-50" >
                <div className="cursor-pointer top-0 left-0 relative z-50" onClick={() => router.push("/")}>
                    <Image src="/Layer_1.png" alt="logo" width={200} height={200} priority className="object-cover w-full h-full" />
                </div>
                <div className="flex space-x-4 lg:block hidden relative z-50">
                    <Link href="/" className={` ${pathname === "/" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Inicio</Link>
                    <Link href="/construction" className={` ${pathname === "/construction" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Contactos</Link>
                    <Link href="/construction" className={` ${pathname === "/construction" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Trabajos</Link>
                    <Link href="/construction" className={` ${pathname === "/construction" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Blogs</Link>
                </div>
            </div>
        </Container>
    )
}

export default Header;