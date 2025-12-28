import { Container } from "@bitnation-dev/components";
import { useState } from "react";
import {
    Diseño,
    DiseñoColor,
    Entrega,
    EntregaColor,
    Propuesta,
    PropuestaColor,
    Reunion,
    ReunionColor,
} from "./icons";

const processText = [
    {
        title: "Reunión Inicial",
        text: "Nos reunimos contigo para entender tus necesidades, objetivos y expectativas. Analizamos la identidad de tu marca, el público objetivo y los requisitos del proyecto. Además, establecemos un presupuesto y un cronograma preliminar.",
    },
    {
        title: "Propuesta",
        text: "Basándonos en la información recopilada, creamos una propuesta detallada que incluye el alcance del proyecto, tiempos de entrega, costos y metodología de trabajo. Incluimos moodboards, referencias visuales o bocetos iniciales para alinear nuestra visión con la tuya.",
    },
    {
        title: "Diseño y Desarrollo",
        text: "Una vez aprobada la propuesta, nuestro equipo de diseño gráfico y desarrollo web comienza a trabajar en soluciones creativas. Desarrollamos conceptos, bocetos y prototipos, realizando iteraciones y pruebas para garantizar un diseño funcional y atractivo.",
    },
    {
        title: "Presentación y Ajustes",
        text: "Presentamos el diseño final, explicando el proceso creativo y las decisiones detrás de cada elemento. Recibimos tus comentarios y realizamos ajustes o refinamientos hasta lograr un resultado que supere tus expectativas.",
    },
    {
        title: "Entrega y Soporte",
        text: "Una vez aprobado, entregamos el material en los formatos adecuados (archivos digitales, especificaciones técnicas, guías de uso o productos impresos). Además, ofrecemos soporte posterior para asegurar una implementación exitosa.",
    },
];

const Comotrabajamos = () => {
    const [selectedProcess, setSelectedProcess] = useState<number | null>(0);
    const handleProcessClick = (index: number) => {
        setSelectedProcess(index);
    };
    return (
        <Container className="h-[80vh] ">
            <div className="flex flex-col w-full items-start justify-start md:items-center md:justify-center">
                <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text text-2xl w-fit font-bold">
                    ¿Cómo trabajamos?
                </span>
                <h2 className="text-white text-4xl md:text-6xl  font-bold font-['Poppins'] lg:text-9xl">
                    Nuestro Proceso
                </h2>
            </div>
            <div className="flex items-center w-full h-[40vh] justify-between px-20 overflow-x-auto">
                <div
                    className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => handleProcessClick(0)}
                >
                    {selectedProcess === 0 ? <ReunionColor /> : <Reunion />}
                    <span className="text-white text-xl font-bold">Reunión</span>
                </div>
                <div className="h-16 flex px-4">
                    <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
                </div>
                <div
                    className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => handleProcessClick(1)}
                >
                    {selectedProcess === 1 ? <PropuestaColor /> : <Propuesta />}
                    <span className="text-white text-xl font-bold">Propuesta</span>
                </div>
                <div className="h-16 flex px-4">
                    <div className="flex-shrink gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
                </div>
                <div
                    className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => handleProcessClick(2)}
                >
                    {selectedProcess === 2 ? <DiseñoColor /> : <Diseño />}
                    <span className="text-white text-xl font-bold">Diseño</span>
                </div>
                <div className="h-16 flex px-4">
                    <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
                </div>
                <div
                    className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => handleProcessClick(3)}
                >
                    {selectedProcess === 3 ? <ReunionColor /> : <Reunion />}
                    <span className="text-white text-xl font-bold">Presentacion</span>
                </div>
                <div className="h-16 flex px-4">
                    <div className="flex-shrink-0 gap-4 bg-[#343434] w-8 h-[1px] items-center justify-center"></div>
                </div>
                <div
                    className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => handleProcessClick(4)}
                >
                    {selectedProcess === 4 ? <EntregaColor /> : <Entrega />}
                    <span className="text-white text-xl font-bold">Entrega</span>
                </div>
            </div>
            {selectedProcess !== null && (
                <div className="flex flex-col gap-4 mt-8 w-full">
                    <span className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text font-bold text-3xl w-fit ">
                        {processText[selectedProcess].title}
                    </span>
                    <span className="text-white text-xl w-full md:w-1/2">
                        {processText[selectedProcess].text}
                    </span>
                </div>
            )}
        </Container>
    );
};

export default Comotrabajamos;