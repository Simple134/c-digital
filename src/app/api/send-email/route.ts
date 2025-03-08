import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Crear un transporter de prueba para desarrollo
  let transporter;
  
  // Para entorno de producción, usa credenciales reales
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'false' ? false : true, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER || 'hola@estudiocdigital.com',
        pass: process.env.SMTP_PASS || '',
      },
    });
  } else {
    // Para entorno de desarrollo, usar ethereal.email (correos de prueba)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('Error al crear cuenta de prueba:', error);
      // Fallback a Hostinger en caso de error con Ethereal
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'false' ? false : true,
        auth: {
          user: process.env.SMTP_USER || 'hola@estudiocdigital.com',
          pass: process.env.SMTP_PASS || '',
        },
      });
    }
  }
  
  // Formatea los servicios seleccionados
  const serviciosSeleccionados = Array.isArray(data.servicios) 
    ? data.servicios.join(', ') 
    : data.servicios || 'No especificado';
  
  try {
    // Envía el correo
    const info = await transporter.sendMail({
      from: `"Formulario Web" <${process.env.SMTP_USER || 'hola@estudiocdigital.com'}>`,
      to: 'hola@estudiocdigital.com',
      subject: `Nuevo contacto: ${data.nombre}`,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${data.nombre}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Servicios:</strong> ${serviciosSeleccionados}</p>
        <p><strong>Descripción:</strong> ${data.descripcion}</p>
        ${data.archivoAdjunto ? `<p><strong>Archivo adjunto:</strong> ${data.archivoAdjunto}</p>` : ''}
      `,
    });
    
    // Si estamos en desarrollo, mostrar la URL para ver el correo de prueba
    if (process.env.NODE_ENV !== 'production' && info.messageId.includes('ethereal')) {
      console.log('URL para ver el correo de prueba:', nodemailer.getTestMessageUrl(info));
    }
    
    return NextResponse.json({ success: true });
  } catch (error: Error | unknown) {
    console.error('Error al enviar email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: errorMessage },
      { status: 500 }
    );
  }
} 