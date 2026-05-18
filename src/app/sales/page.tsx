"use client";
import Link from "next/link";
import salesPapersAnimation from "@/lotties/sales-papers.json";
import dynamic from "next/dynamic";
import { GradientText } from "@/components/gradient-text";
import { Header } from "@/components/headerBitnation";
import { MouseParallaxSection } from "@/effects/mouse-paralax";
import { SuccessStories } from "./success-stories";
import { ScheduleButton } from "./schedule-button";
import { CursorGradient } from "@/components/gradient-cursor";
import InfiniteLogo from "@/components/infiniteLogo";
import PainPoints from "./pain-points";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Sales() {
  return (
    <div className="relative">
      <CursorGradient />
      <div className="relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 py-10 items-center">
            <MouseParallaxSection depth={4} centerX={0.3} centerY={0.5}>
              <div className=" flex flex-col">
                <p className=" mb-5">
                  Desarrollamos{" "}
                  <GradientText>aplicaciones y software a medida</GradientText>
                  <br /> desde cero hasta el éxito.
                </p>
                <Header as="h1" className=" mb-10 min-h-[100px]">
                  ¿Busca desarrollar una app móvil o software a medida?
                </Header>
                <p className=" mb-10">
                  Reciba una <GradientText>consultoría gratuita</GradientText>{" "}
                  en desarrollo de software, registrándose aquí debajo.
                </p>
                <ScheduleButton />
              </div>
            </MouseParallaxSection>
            <div className="">
              <Lottie
                animationData={salesPapersAnimation}
                loop
                autoplay
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
        <div className=" bg-white my-10">
          <InfiniteLogo />
        </div>

        <PainPoints />

        {/* Why us */}
        <div className="backdrop-blur-xl bg-black/30">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-8 items-center">
              <MouseParallaxSection depth={12} centerX={0.3} centerY={0.7}>
                <div className=" flex flex-col gap-10 max-w-[740px]">
                  <p>
                    <GradientText>En C-Digital</GradientText> podemos ayudarlo a
                    realizar su proyecto con un enfoque en la calidad y el tiempo.
                    Nos comprometemos en volvemos su Partner tecnológico.
                  </p>
                  <Header>¿Por qué trabajar con C-Digital?</Header>
                  <div className="pl-5">
                    <ul className="list-disc">
                      <li>
                        Garantizamos calidad en cada proyecto por contrato,
                        asegurando su funcionamiento al 100%.
                      </li>
                      <li>Ofrecemos métodos de pago flexibles a tu medida.</li>
                      <li>
                        Diseñamos experiencias visuales modernas con animaciones e
                        inteligencia artificial.
                      </li>
                      <li>Nos convertimos en tu socio tecnológico.</li>
                      <li>
                        Optimiza tu empresa con software a medida, automatizando
                        procesos para ahorrar tiempo y dinero.
                      </li>
                    </ul>
                  </div>
                  <ScheduleButton />
                </div>
              </MouseParallaxSection>
              <div>
                <img src="/sales/guys-down.png" alt="Sales" />
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-black/30 py-28">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
              <div className=" flex flex-col gap-5">
                <p>
                  <strong>
                    <GradientText>Nuestros servicios principales</GradientText>
                  </strong>
                </p>
                <Header>Desarrollo de Software a la Medida</Header>
                <p>
                  Desarrollamos Software/Sistemas a medida, adaptado a las
                  necesidades de tu empresa, con la mejor tecnología del mercado.
                  Nuestras soluciones son flexibles, eficientes y de alto
                  rendimiento.
                </p>
                <div className=" mt-5">
                  <ScheduleButton />
                </div>
              </div>
              <MouseParallaxSection depth={2} centerX={0.7} centerY={0.3}>
                <div>
                  <Lottie
                    animationData={salesPapersAnimation}
                    loop
                    autoplay
                    className="w-full h-full"
                  />
                </div>
              </MouseParallaxSection>
            </div>
          </div>
        </div>

        {/* Success stories */}
        <SuccessStories cta={<ScheduleButton />} />
        {/* About us */}
        <MouseParallaxSection depth={4} centerX={0.3} centerY={0.7}>
          <div className="backdrop-blur-xl bg-black/30 py-28">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                <div>
                  <img src="/sales/guys-right.png" alt="Sales" />
                </div>
                <div className=" flex flex-col gap-5">
                  <p>
                    <strong>
                      <GradientText>Sobre nosotros</GradientText>
                    </strong>
                  </p>
                  <p>
                    En C-Digital, somos el socio tecnológico ideal para empresas y
                    emprendedores, brindando soluciones de desarrollo de software
                    nativo, aplicaciones móviles (iOS, Android) y web.
                  </p>
                  <p>
                    Nos mantenemos a la vanguardia, innovando y explorando nuevas
                    tecnologías para ofrecer productos eficientes y de alta
                    calidad.
                  </p>
                  <p>
                    Sumamos más de 12 años de experiencia, nuestro equipo de
                    expertos está listo para convertir tu proyecto en realidad.
                  </p>
                  <ScheduleButton />
                </div>
              </div>
            </div>
          </div>
        </MouseParallaxSection>

        <div className="backdrop-blur-xl bg-white py-16">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className=" flex flex-col gap-10">
                <Header className=" text-black">Momento de la Acción</Header>
                <p className=" text-black">
                  Si llegaste hasta aquí, es porque quieres llevar tu negocio
                  hasta la luna. No dejes tu idea en pausa.
                </p>
                <p className=" text-black">
                  Haz clic en{" "}
                  <Link href={"/contacto"} target="_blank">
                    <GradientText>Agendar consultoría</GradientText>
                  </Link>{" "}
                  y demos juntos el primer paso. Te ayudaremos a desarrollar tu
                  software, Idea o App, ahorrando tiempo y maximizando tu
                  inversión. 🚀
                </p>
              </div>
              <div className=" flex justify-end items-end h-full">
                <div className="h-fit">
                  <img src="/logoBlack.png" alt="Sales" height={24} width={246} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
