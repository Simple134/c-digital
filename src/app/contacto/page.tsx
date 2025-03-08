'use client';
import { Container, Grid } from "@bitnation-dev/components";
import { useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useState, Suspense } from "react";

// Componente wrapper con Suspense
const ContactoContent = () => {
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service');
  const [fileSelected, setFileSelected] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>(initialService ? [initialService] : []);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setEnviando(true);
      
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        formData.append(key, data[key as keyof typeof data]);
      });
      
      formData.append('servicios', selectedServices.join(', ') || 'No especificado');
      
      formData.append('_to', 'hola@estudiocdigital.com');
      
      const response = await fetch('https://formsubmit.co/ajax/hola@estudiocdigital.com', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setEnviado(true);
        reset();
        setSelectedServices([]);
        setFileSelected("");
        setTimeout(() => setEnviado(false), 5000);
      } else {
        alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(e.target.files[0].name);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
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
            <h1 className="text-white text-6xl sm:text-5xl md:text-6xl font-bold font-['Poppins'] lg:text-8xl">
              No Perdamos Tiempo
            </h1>
            <span className="text-white text-lg sm:text-xl font-['Poppins'] lg:text-2xl pt-6 md:pt-12">
              Ya vas por buen camino, solo nos dices que <br className="hidden sm:block" /> necesitas y
              nosotros nos encargamos, guiarte.
            </span>
          </div>
          <div className="flex flex-col bg-white p-6  lg:h-[75vh] justify-center">
            {enviado ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 className="text-2xl font-bold mb-2">¡Mensaje enviado con éxito!</h2>
                <p className="text-gray-600 text-center">Nos pondremos en contacto contigo lo antes posible.</p>
              </div>
            ) : (
              <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="w-full"
              >
                <div className="w-full space-y-8">
                  <span className="text-black text-xl">
                    Tu interes se centra en..
                  </span>
                  <Grid columns={{ xl: 3, lg: 3, md: 2, sm: 2 }} className="mb-4">
                    <button 
                      type="button"
                      onClick={() => toggleService('diseño-app')}
                      className={`w-full h-14 hover:border-black text-xl font-bold hover:text-black ${
                        isServiceSelected('diseño-app') 
                          ? 'text-black border-black border-2' 
                          : 'text-gray-400 border-gray-400 border-2'
                      }`}
                    >
                      Diseño de App
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleService('desarrollo-web')}
                      className={`w-full h-14 hover:border-black text-xl font-bold hover:text-black ${
                        isServiceSelected('desarrollo-web') 
                          ? 'text-black border-black border-2' 
                          : 'text-gray-400 border-gray-400 border-2'
                      }`}
                    >
                      Desarrollo Web
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleService('branding')}
                      className={`w-full h-14 hover:border-black text-xl font-bold hover:text-black ${
                        isServiceSelected('branding') 
                          ? 'text-black border-black border-2' 
                          : 'text-gray-400 border-gray-400 border-2'
                      }`}
                    >
                      Branding
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleService('desarrollo-sistemas')}
                      className={`w-full h-14 hover:border-black text-xl font-bold hover:text-black ${
                        isServiceSelected('desarrollo-sistemas') 
                          ? 'text-black border-black border-2' 
                          : 'text-gray-400 border-gray-400 border-2'
                      }`}
                    >
                      Desarrollo de Sistemas
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleService('marketing')}
                      className={`w-full h-14 hover:border-black text-xl font-bold hover:text-black ${
                        isServiceSelected('marketing') 
                          ? 'text-black border-black border-2' 
                          : 'text-gray-400 border-gray-400 border-2'
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
                    className="w-full h-14 border-b-2 text-black border-gray-400 my-4 p-2"
                    {...register("nombre", { required: true })}
                  />
                  {errors.nombre && <span className="text-red-500">Este campo es obligatorio</span>}
                  
                  <input 
                    type="email" 
                    placeholder="Tu email Principal"
                    className="w-full h-14 border-b-2 text-black border-gray-400 my-4 p-2"
                    {...register("email", { 
                      required: true, 
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
                    })}
                  />
                  {errors.email && <span className="text-red-500">Ingresa un email válido</span>}
                  
                  <textarea 
                    placeholder="Cuentanos un poco sobre el proyecto"
                    className="w-full h-28 border-b-2 text-black border-gray-400 my-4 p-2 resize-none"
                    {...register("descripcion", { required: true })}
                  />
                  {errors.descripcion && <span className="text-red-500">Este campo es obligatorio</span>}
                  
                  <div className="relative mt-12">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="fileInput"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      name="_file"
                    />
                    <label 
                      htmlFor="fileInput" 
                      className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800"
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span className="text-black text-xl">
                        {fileSelected ? fileSelected : "Adjuntar archivo/Imagen"}
                      </span>
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={enviando}
                    className={`w-72 p-4 mt-12 h-14 bg-black text-white text-xl font-bold hover:bg-gray-800 ${
                      enviando ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {enviando ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
                {/* FormSubmit honeypot field to prevent spam */}
                <input type="text" name="_honey" style={{ display: 'none' }} />
                {/* Disable captcha */}
                <input type="hidden" name="_captcha" value="false" />
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
    <Suspense fallback={
      <div className="relative min-h-screen w-full pt-24 pb-14 lg:py-20">
        <Container className="flex items-center justify-center h-full">
          <div className="text-white text-xl">Cargando...</div>
        </Container>
      </div>
    }>
      <ContactoContent />
    </Suspense>
  );
};

export default Contacto;
