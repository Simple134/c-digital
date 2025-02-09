"use client"

import { useRouter } from "next/navigation";
import { Container } from "@bitnation-dev/components"
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";


const Header = () => {
    const router = useRouter()
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null // No renderizar nada hasta que el componente esté montado en el cliente
    }

    return (
            <>
                <div className="flex justify-between items-center text-white h-full w-full !p-0 !m-0 px-4 md:px-12">
                    <div className="cursor-pointer" onClick={() => router.push("/")}>
                        <Image src="/Layer_1.png" alt="logo" width={200} height={200} />
                </div>


                <button
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        ) : (
                            <path fillRule="evenodd" d="M4 6a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm0 5a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm1 4a1 1 0 100 2h14a1 1 0 100-2H5z" clipRule="evenodd" />
                        )}
                    </svg>
                </button>

                <div className={`
                    md:flex md:space-x-8
                    absolute md:relative top-16 md:top-0 
                    right-0 md:right-auto 
                    w-28 md:w-auto 
                    bg-black md:bg-transparent
                    ${mounted && isMenuOpen ? 'flex' : 'hidden'}
                    flex-col md:flex-row
                    md:items-center
                    py-4
                    px-4 md:px-0
                    md:py-0
                    space-y-4 md:space-y-0 z-50
                `}>
                    <Link href="/" className={` ${pathname === "/" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Inicio</Link>
                    <Link href="/" className={` ${pathname === "/servicios" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Trabajos</Link>
                    <Link href="/" className={` ${pathname === "/portafolio" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Blogs</Link>
                    <Link href="/" className={` ${pathname === "/contactos" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Contactos</Link>
                </div>
                </div>

            </>



    )
}

export default Header;