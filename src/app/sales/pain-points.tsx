import { Grid, Container } from "@bitnation-dev/components";
import { GradientText } from "@/components/gradient-text";
import { Header } from "@/components/headerBitnation";
import {
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/media-query";

const useDetailsStyle = (
  presence: MotionValue<number>,
): {
  opacity: MotionValue<number>;
  translateX: MotionValue<number>;
} => {
  const opacity = useTransform(presence, [0.2, 1], [0, 1]);
  const translateX = useTransform(presence, [0.2, 1], [-100, 0]);
  return {
    opacity,
    translateX,
  };
};

const useTitleStyle = (
  presence: MotionValue<number>,
): {
  scale: MotionValue<number>;
  translateX: MotionValue<number>;
  opacity: MotionValue<number>;
  height: MotionValue<string>;
} => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scale = useTransform(presence, [0.2, 1], [0.8, 1]);
  const translateX = useTransform(presence, [0.2, 1], [0, 16]);
  const opacity = useTransform(presence, [0.2, 1], [0, 1]);
  const height = useTransform(
    presence,
    [0.2, 1],
    ["0", isMobile ? "0.6em" : "2em"],
  );
  return {
    scale,
    translateX,
    opacity,
    height,
  };
};

export default function PainPoints() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scroll = useMotionValue(0);
  const [isSticky, setIsSticky] = useState(true);
  const opacityFirst = useTransform(scroll, [0, 0.8, 1], [1, 1, 0.2]);
  const opacitySecond = useTransform(
    scroll,
    [0.8, 1, 1.8, 2],
    [0.2, 1, 1, 0.2],
  );
  const opacityThird = useTransform(scroll, [1.8, 2, 3], [0.2, 1, 1]);

  const detailsFirst = useDetailsStyle(opacityFirst);
  const detailsSecond = useDetailsStyle(opacitySecond);
  const detailsThird = useDetailsStyle(opacityThird);

  const titleFirst = useTitleStyle(opacityFirst);
  const titleSecond = useTitleStyle(opacitySecond);
  const titleThird = useTitleStyle(opacityThird);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [top, setTop] = useState(0);

  useEffect(() => {
    const top = ref.current?.offsetTop;
    setTop(top || 0);
  }, [ref]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const screenHeight = window.innerHeight * 2;
    const diff = latest - top;
    const progress = Math.max(0, diff);
    const scrollProgress = progress / screenHeight;
    const dampedScrollProgress = scrollProgress.toFixed(3);
    scroll.set(parseFloat(dampedScrollProgress));
    setIsSticky(scrollProgress < 3);
  });

  return (
    <div ref={ref} className="h-[600vh] z-20 relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('/sales/bg.jpeg')",
          backgroundBlendMode: "soft-light",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div
        className={`${
          isSticky
            ? "sticky top-0"
            : " absolute top-[500vh] w-full h-screen overflow-hidden"
        }`}
      >
        <div className="backdrop-blur-xl h-screen flex items-center justify-center">
          <Container className=" [&_.container-inside]:max-w-[840px] !md:py-28 !py-10 overflow-hidden">
            <Header className="text-white max-w-[440px] md:mb-16 mb-5">
              ¿Se identifica con algo de esto?
            </Header>
            <Grid className="h-full" columns={{ xl: 2, md: 1 }}>
              <div>
                <ul>
                  <motion.li
                    style={{
                      opacity: opacityFirst,
                      scale: titleFirst.scale,
                      translateX: titleFirst.translateX,
                      transformOrigin: "left",
                    }}
                  >
                    <p className="text-2xl">
                      <motion.span
                        style={{
                          width: 2,
                          height: titleFirst.height,
                          opacity: titleFirst.opacity,
                          backgroundColor: "white",
                          display: "inline-block",
                          translateX: isMobile ? -12 : -16,
                        }}
                      />
                      <GradientText>
                        Asesoría y <br className=" hidden md:block" />
                        Consultoría Experta
                      </GradientText>
                    </p>
                  </motion.li>
                  <motion.li
                    style={{
                      opacity: opacitySecond,
                      scale: titleSecond.scale,
                      translateX: titleSecond.translateX,
                      transformOrigin: "left",
                    }}
                  >
                    <p className="text-2xl">
                      <motion.span
                        style={{
                          width: 2,
                          height: titleSecond.height,
                          opacity: titleSecond.opacity,
                          backgroundColor: "white",
                          display: "inline-block",
                          translateX: isMobile ? -12 : -16,
                        }}
                      />
                      <GradientText>
                        Soluciones <br className=" hidden md:block" />
                        Personalizadas
                      </GradientText>
                    </p>
                  </motion.li>
                  <motion.li
                    style={{
                      opacity: opacityThird,
                      scale: titleThird.scale,
                      translateX: titleThird.translateX,
                      transformOrigin: "left",
                    }}
                  >
                    <p className="text-2xl">
                      <motion.span
                        style={{
                          width: 2,
                          height: titleThird.height,
                          opacity: titleThird.opacity,
                          backgroundColor: "white",
                          display: "inline-block",
                          translateX: isMobile ? -12 : -16,
                        }}
                      />
                      <GradientText>
                        Confianza y <br className=" hidden md:block" />
                        Compromiso
                      </GradientText>
                    </p>
                  </motion.li>
                </ul>
              </div>
              <div className="pl-4">
                <div className="grid">
                  <motion.div
                    style={{
                      opacity: detailsFirst.opacity,
                      translateX: detailsFirst.translateX,
                    }}
                    className=" col-start-1 row-start-1"
                  >
                    <ul className="list-disc">
                      <li>
                        ¿Necesitas un experto que te oriente en cada paso de tu
                        proyecto digital?
                      </li>
                      <li>
                        ¿Te gustaría validar y perfeccionar tu idea con asesoría
                        especializada?
                      </li>
                      <li>
                        ¿Quieres transformar tus conceptos en una solución
                        tecnológica viable desde el inicio?
                      </li>
                      <li>
                        ¿Buscas un análisis estratégico que potencie el
                        desarrollo de tu app o software?
                      </li>
                      <li>
                        ¿Deseas contar con una consultoría personalizada que te
                        brinde claridad y dirección en tu proyecto?
                      </li>
                    </ul>
                  </motion.div>
                  <motion.div
                    style={{
                      opacity: detailsSecond.opacity,
                      translateX: detailsSecond.translateX,
                    }}
                    className=" col-start-1 row-start-1"
                  >
                    <ul className="list-disc">
                      <li>
                        ¿Tu empresa enfrenta desafíos de gestión que necesitan
                        soluciones tecnológicas personalizadas?
                      </li>
                      <li>
                        ¿Has notado que las soluciones genéricas no abordan tus
                        problemas operativos?
                      </li>
                      <li>
                        ¿Buscas desarrollar un software que se ajuste
                        perfectamente a las necesidades de tu negocio?
                      </li>
                      <li>
                        ¿Necesitas una herramienta a medida para mejorar la
                        eficiencia y la gestión interna de tu empresa?
                      </li>
                      <li>
                        ¿Te gustaría implementar una solución tecnológica
                        diseñada exclusivamente para resolver tus retos
                        específicos?
                      </li>
                    </ul>
                  </motion.div>
                  <motion.div
                    style={{
                      opacity: detailsThird.opacity,
                      translateX: detailsThird.translateX,
                    }}
                    className=" col-start-1 row-start-1"
                  >
                    <ul className="list-disc">
                      <li>
                        ¿Estás cansado de propuestas sin compromiso ni
                        seguimiento real?
                      </li>
                      <li>
                        ¿Buscas una empresa de desarrollo que se responsabilice
                        por cada etapa de tu proyecto?
                      </li>
                      <li>
                        ¿Te has sentido frustrado con cotizaciones y asesorías
                        poco claras en el pasado?
                      </li>
                      <li>
                        ¿Deseas un socio tecnológico que entienda tus objetivos
                        y se comprometa con tus resultados?
                      </li>
                      <li>
                        ¿Quieres trabajar con un equipo de confianza que
                        garantice transparencia y calidad en cada entrega?
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </Grid>
          </Container>
        </div>
      </div>
    </div>
  );
}
