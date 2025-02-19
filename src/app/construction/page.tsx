"use client"
import Image from "next/image"

const Construction = () => {
    const handleWhatsAppClick = () => {
        window.open(`https://wa.link/h0k461`, '_blank')
    }

    const handleInstagramClick = () => {
        window.open('https://instagram.com/cdigitalestudio', '_blank')
    }

    const handleYouTubeClick = () => {
        window.open('https://www.youtube.com/@UXCarlos_DR/videos', '_blank')
    }

    return (
        <div className="relative flex flex-col items-center justify-center h-[90vh] w-full space-y-8 bg-black">
            <div className="flex flex-col items-center justify-center space-y-4 ">
                <h1 className="text-white text-6xl text-center font-bold font-['Poppins'] lg:text-9xl">
                    Web en Trabajo


                </h1>
                <p className="text-white w-[80%] text-center font-['Poppins'] lg:text-xl">
                    Contáctanos en <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">Nuestras Redes</span>
                </p>
                <div className="flex gap-8 ">
                    <Image
                        src="/whatsapp.png"
                        alt="WhatsApp"
                        width={50}
                        height={50}
                        onClick={handleWhatsAppClick}
                        className="cursor-pointer"
                    />
                    <Image
                        src="/instagram.png"
                        alt="Instagram"
                        width={50}
                        height={50}
                        onClick={handleInstagramClick}
                        className="cursor-pointer"
                    />
                    <Image
                        src="/youtube.png"
                        alt="YouTube"
                        width={50}
                        height={50}
                        onClick={handleYouTubeClick}
                        className="cursor-pointer"
                    />
                </div>
                <div className="absolute items-end justify-center bottom-12" >
                    <a href="mailto:hola@estudiocdigital.com" className="text-[#5A5A5A] text-lg tracking-wide" > hola@estudiocdigital.com</a>
                </div>
            </div>
        </div>
    )
}

export default Construction