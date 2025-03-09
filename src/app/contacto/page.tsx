"use client";
import { Container, Grid } from "@bitnation-dev/components";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useState, Suspense } from "react";

// Componente wrapper con Suspense
const ContactoContent = () => {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialService ? [initialService] : []
  );
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setEnviando(true);

      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        formData.append(key, data[key as keyof typeof data]);
      });

      formData.append(
        "servicios",
        selectedServices.join(", ") || "No especificado"
      );

      // Añadir todos los archivos seleccionados
      selectedFiles.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });

      // Añadir lista de nombres de archivos
      formData.append(
        "archivosAdjuntos",
        selectedFiles.map((file) => file.name).join(", ")
      );

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setEnviado(true);
        reset();
        setSelectedServices([]);
        setSelectedFiles([]);
        setTimeout(() => setEnviado(false), 5000);
      } else {
        const errorData = await response.json();
        console.error("Error al enviar el mensaje:", errorData);
        alert("Error al enviar el mensaje. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Error al enviar el mensaje. Por favor intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertir FileList a Array y añadir los nuevos archivos a los existentes
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const isServiceSelected = (service: string) => {
    return selectedServices.includes(service);
  };

  return (
    <div className="relative min-h-screen w-full pt-24 pb-14 lg:py-20">
      <Container className="flex flex-col items-center justify-center h-full w-full z-50 !p-0 !m-0">
        <Grid columns={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <div className="flex flex-col justify-center pb-4">
            <h2 className="text-white text-5xl  font-bold font-['Poppins'] lg:text-7xl">
              No Perdamos Tiempo
            </h2>
            <span className="text-white lg:text-lg text-md  font-['Poppins'] lg:text-2xl pt-6 md:pt-12">
            Nos dices que necesitas y nosotros nos <br className="hidden sm:block" />  encargamos de guiarte en el proceso.
            </span>
          </div>
          <div className="flex flex-col bg-white px-10 py-28 min-h-[75vh] max-h-[100vh]">
            {enviado ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg
                  className="w-16 h-16 text-green-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <h2 className="text-2xl font-bold mb-2">
                  ¡Mensaje enviado con éxito!
                </h2>
                <p className="text-gray-600 text-center">
                  Nos pondremos en contacto contigo lo antes posible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="w-full space-y-6 mb-8 ">
                  <span className="text-black text-xl">
                    Selecciona los Servicios de interés
                  </span>
                  <Grid
                    columns={{ xl: 3, lg: 3, md: 2, sm: 2 }}
                    className="mb-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleService("diseño-app")}
                      className={`  h-12 lg:hover:border-black lg:text-xl text-md font-bold ${
                        isServiceSelected("diseño-app")
                          ? "text-black border-black border-2"
                          : "text-gray-400 border-gray-400 border-2"
                      }`}
                    >
                      Diseño de App
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleService("desarrollo-web")}
                      className={`h-12 lg:hover:border-black lg:text-xl text-md font-bold  ${
                        isServiceSelected("desarrollo-web")
                          ? "text-black border-black border-2"
                          : "text-gray-400 border-gray-400 border-2"
                      }`}
                    >
                      Desarrollo Web
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleService("branding")}
                      className={`w-30 ml-0 h-12 lg:hover:border-black lg:text-xl text-md font-bold  order-last md:order-none ${
                        isServiceSelected("branding")
                          ? "text-black border-black border-2"
                          : "text-gray-400 border-gray-400 border-2"
                      }`}
                    >
                      Branding
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleService("desarrollo-sistemas")}
                      className={`lg:w-72 lg:h-12 lg:p-0 w-48 h-12 lg:hover:border-black lg:text-xl text-md font-bold  ${
                        isServiceSelected("desarrollo-sistemas")
                          ? "text-black border-black border-2"
                          : "text-gray-400 border-gray-400 border-2"
                      }`}
                    >
                      Desarrollo de Sistemas
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleService("marketing")}
                      className={`lg:w-36 w-28 lg:ml-[98px] ml-12 h-12 hover:border-black lg:text-xl text-md font-bold  ${
                        isServiceSelected("marketing")
                          ? "text-black border-black border-2"
                          : "text-gray-400 border-gray-400 border-2"
                      }`}
                    >
                      Marketing
                    </button>
                  </Grid>
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Tu nombre/Empresa"
                    className="w-full h-14 border-b-2 text-black border-gray-400 my-4 p-2 lg:text-xl"
                    {...register("nombre", { required: true })}
                  />
                  {errors.nombre && (
                    <span className="text-red-500">
                      Este campo es obligatorio
                    </span>
                  )}

                  <input
                    type="email"
                    placeholder="Tu email Principal"
                    className="w-full h-14 border-b-2 text-black border-gray-400 my-4 p-2 lg:text-xl"
                    {...register("email", {
                      required: true,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    })}
                  />
                  {errors.email && (
                    <span className="text-red-500">
                      Ingresa un email válido
                    </span>
                  )}

                  <textarea
                    placeholder="Cuentanos un poco sobre el proyecto"
                    className="w-full h-14 border-b-2 text-black border-gray-400 my-4 p-2 resize-none lg:text-xl"
                    {...register("descripcion", { required: true })}
                  />
                  {errors.descripcion && (
                    <span className="text-red-500">
                      Este campo es obligatorio
                    </span>
                  )}

                  <div className="relative mt-5">
                    <input
                      type="file"
                      className="hidden"
                      id="fileInput"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      name="attachment"
                    />
                    <label
                      htmlFor="fileInput"
                      className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.41797 10.3735L9.3143 2.4772C9.72359 2.05923 10.2117 1.72656 10.7504 1.49845C11.2891 1.27033 11.8676 1.15129 12.4526 1.14822C13.0376 1.14515 13.6174 1.25811 14.1584 1.48056C14.6995 1.70301 15.1911 2.03053 15.6047 2.44418C16.0184 2.85784 16.3459 3.34941 16.5683 3.89046C16.7908 4.4315 16.9037 5.01129 16.9007 5.59628C16.8976 6.18126 16.7786 6.75983 16.5504 7.29852C16.3223 7.8372 15.9897 8.32531 15.5717 8.73459L8.19604 16.1086C7.73912 16.5507 7.12675 16.7955 6.49098 16.7903C5.85521 16.785 5.24696 16.5301 4.79739 16.0806C4.34781 15.631 4.09293 15.0227 4.08769 14.387C4.08245 13.7512 4.32728 13.1388 4.76939 12.6819L11.8458 5.60463"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="text-black text-xl">
                        {selectedFiles.length > 0
                          ? "Añadir más archivos"
                          : "Adjuntar archivo/Imagen"}
                      </span>
                    </label>
                  </div>

                  {/* Lista de archivos seleccionados */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded p-3">
                      <p className="text-gray-700 font-medium mb-2">
                        Archivos seleccionados:
                      </p>
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <svg
                                className="w-5 h-5 text-gray-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className={`w-72 p-2 mt-14 h-14 bg-black text-white text-2xl font-bold hover:bg-gray-800 ${
                      enviando ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {enviando ? "Enviando..." : "Enviar mensaje"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Grid>
      </Container>
    </div>
  );
};

// Componente principal que envuelve el contenido en Suspense
const Contacto = () => {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full pt-24 pb-14 lg:py-20">
          <Container className="flex items-center justify-center h-full">
            <div className="text-white text-xl">Cargando...</div>
          </Container>
        </div>
      }
    >
      <ContactoContent />
    </Suspense>
  );
};

export default Contacto;
