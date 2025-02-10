"use client"

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Header = ({ onClick }: { onClick: (openState: boolean) => void }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleHomeClick = () => {
        router.push("/")
        onClick(false) 
    }

    if (!mounted) {
        return null 
    }


    return (
        <>
            <div className="flex justify-end items-end text-white h-full w-full !p-0 !m-0 px-4 md:px-12 relative">
                <div className="cursor-pointer absolute top-0 left-0" onClick={handleHomeClick}>
                    <Image src="/Layer_1.png" alt="logo" width={200} height={200} priority className="object-cover w-full h-full"/>
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
                <div className="flex space-x-4 lg:block hidden">
                    <Link href="/" onClick={handleHomeClick} className={` ${pathname === "/" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Inicio</Link>
                    <Link href="/" onClick={() => onClick(true)} className={` ${pathname === "/servicios" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Trabajos</Link>
                    <Link href="/" onClick={() => onClick(true)} className={` ${pathname === "/portafolio" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Blogs</Link>
                    <Link href="/" onClick={() => onClick(true)} className={` ${pathname === "/contactos" ? "text-[#01aaa8] font-bold" : "hover:text-[#9F9F9F] font-normal"} font-['Poppins']`}>Contactos</Link>
                </div>
            </div>

        </>



    )
}

export default Header;