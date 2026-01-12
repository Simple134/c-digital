import { useState, useEffect } from "react";

export const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Considera móvil si es menor a 768px
    };

    // Verificar tamaño inicial
    checkScreenSize();

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkScreenSize);

    // Limpiar listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile;
};
