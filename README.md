# Estudio C Digital - Formulario de Contacto

## Configuración del envío de correos

El formulario de contacto envía correos electrónicos utilizando nodemailer. Hay dos modos de funcionamiento:

### En desarrollo

En modo desarrollo, el sistema utiliza Ethereal (https://ethereal.email/) para simular el envío de correos sin enviarlos realmente. Cada vez que se envía un correo, se genera una URL temporal donde puedes ver el correo simulado. Esta URL se mostrará en la consola del servidor.

### En producción

Para el entorno de producción, debes configurar un servicio SMTP real. Sigue estos pasos:

1. Crea un archivo `.env.local` en la raíz del proyecto (si no existe)
2. Configura las siguientes variables:

```
SMTP_HOST=smtp.tuservidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_usuario@tudominio.com
SMTP_PASS=tu_contraseña
```

#### Si usas Hostinger:

1. Usa la siguiente configuración en `.env.local`:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hola@estudiocdigital.com
SMTP_PASS=tu_contraseña_de_hostinger
```

2. Reemplaza `tu_contraseña_de_hostinger` con la contraseña real de tu correo en Hostinger.

3. Si tienes problemas con el puerto 465, puedes probar con el puerto 587 (cambiando también SMTP_SECURE a false):

```
SMTP_PORT=587
SMTP_SECURE=false
```

#### Si usas Gmail:

1. Ve a https://myaccount.google.com/apppasswords
2. Inicia sesión con la cuenta que usarás para enviar correos
3. Genera una "Contraseña de aplicación" específica para esta aplicación
4. Usa esa contraseña en SMTP_PASS (no uses tu contraseña normal de Gmail)

## Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

## Producción

Para construir el proyecto para producción:

```bash
npm run build
npm start
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
