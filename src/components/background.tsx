"use client";
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { loadFull } from "tsparticles";

declare global {
  interface Window {
    opera?: string;
  }
}

const Background = ({ id = "tsparticles" }: { id?: string }) => {
  const [init, setInit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || window.opera;
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent || "") || window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: isMobile ? 10 : 120,
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: "push",
          },

          onHover: {
            enable: !isMobile,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: isMobile ? 2 : 8,
          },
          repulse: {
            distance: isMobile ? 50 : 200,
            duration: isMobile ? 0.1 : 0.5,
          },
        },
      },
      particles: {
        color: {
          value: "#00d7d7",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: isMobile ? 1 : 4,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            value_area: isMobile ? 200 : 800,
          },
          value: isMobile ? 30 : 70,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: isMobile ? 3 : 5 },
        },
      },
      detectRetina: true,
    }),
    [isMobile],
  );

  if (init) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <Particles
          id={id}
          particlesLoaded={particlesLoaded}
          options={options}
        />
      </div>
    );
  }

  return <></>;
};

export default Background;
