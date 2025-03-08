import { NextResponse } from 'next/server';
// Importación de resend (descomentar cuando se instale)
import { Resend } from 'resend';

// Acceder a la API key desde las variables de entorno
const resendApiKey = process.env.RESEND_API_KEY || 're_Ht5h5wqA_GtJ7JgM6PpSV5ZbLN9bQ9z8S';
let resend: Resend | null = null;

// Inicializar Resend si está disponible
try {
  resend = new Resend(resendApiKey);
} catch (error) {
  console.error('Error al inicializar Resend:', error);
  resend = null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Obtener datos del formulario
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const descripcion = formData.get('descripcion') as string;
    const servicios = formData.get('servicios') as string;
    const archivoAdjunto = formData.get('archivoAdjunto') as string;
    
    // Obtener archivo adjunto si existe
    const fileAttachment = formData.get('attachment') as File | null;
    let attachment;
    
    if (fileAttachment) {
      const fileArrayBuffer = await fileAttachment.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      
      attachment = {
        filename: fileAttachment.name,
        content: fileBuffer
      };
    }
    
    // Configurar el contenido del correo
    const emailContent = `
      <h1>Nuevo mensaje de contacto</h1>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Servicios:</strong> ${servicios}</p>
      <p><strong>Descripción:</strong> ${descripcion}</p>
      ${archivoAdjunto ? `<p><strong>Archivo adjunto:</strong> ${archivoAdjunto}</p>` : ''}
    `;
    
    // Si Resend está disponible, usar Resend
    if (resend) {
      try {
        const data = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Formulario Web <formulario@estudiocdigital.com>',
          to: [process.env.RESEND_TO_EMAIL || 'hola@estudiocdigital.com'],
          subject: `Nuevo contacto: ${nombre}`,
          html: emailContent,
          ...(attachment && {
            attachments: [attachment]
          })
        });
        
        if (data.error) {
          console.error('Error al enviar con Resend:', data.error);
          return NextResponse.json(
            { error: 'Error al enviar el correo', details: data.error },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          provider: 'resend'
        });
      } catch (resendError) {
        console.error('Error al usar Resend:', resendError);
        // Continúa con el fallback
      }
    }
    
    // Fallback: Registrar el intento y devolver éxito para pruebas
    console.log('Correo simulado enviado (fallback):', {
      nombre,
      email,
      servicios,
      descripcion,
      archivoAdjunto,
      tieneArchivo: !!fileAttachment
    });
    
    return NextResponse.json({ 
      success: true, 
      provider: 'fallback',
      message: 'Modo de desarrollo: correo registrado pero no enviado'
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: errorMessage },
      { status: 500 }
    );
  }
} 