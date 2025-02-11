"use client"
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@bitnation-dev/components";

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()

    return (
        <Container className="!w-full bg-transparent relative z-50">
            <div className="flex justify-between items-center text-white !w-full pt-4 relative z-50" >
                <div className="cursor-pointer top-0 left-0 relative z-50" onClick={() => router.push("/")}>
                    <img src="/Layer_1.png" alt="logo" className="object-cover lg:w-64 w-44 h-full"   />
                </div>
                <div className="flex space-x-8 lg:block hidden relative z-50">
                    <Link href="/" className={` ${pathname === "/" ? "bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Inicio</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Trabajos</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Blogs</Link>
                    <Link href="/construction" className={` ${pathname === "" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Contactos</Link>
                </div>
            </div>
        </Container>
    )
}

export default Header;