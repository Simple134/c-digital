#!/usr/bin/env node
/**
 * Obtiene un refresh token de Google para crear eventos de Calendar/Meet.
 *
 * Uso:
 *   1. Crea credenciales OAuth 2.0 (tipo "Aplicación web") en Google Cloud
 *      Console y añade  http://localhost:4567/oauth2callback  como URI de
 *      redirección autorizado.
 *   2. Ejecuta:
 *        GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-refresh-token.mjs
 *   3. Abre en el navegador la URL que imprime, inicia sesión con
 *      diazc6001@gmail.com y acepta los permisos.
 *   4. Copia el GOOGLE_REFRESH_TOKEN que aparece en la terminal a tu .env
 *
 * Este script es de un solo uso: el refresh token no caduca mientras no se
 * revoque el acceso.
 */
import http from "node:http";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 4567;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n❌ Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.\n" +
      "   Ejecuta:\n" +
      "   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-google-refresh-token.mjs\n",
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline", // necesario para recibir refresh_token
  prompt: "consent", // fuerza a Google a devolver un refresh_token nuevo
  scope: ["https://www.googleapis.com/auth/calendar.events"],
});

console.log(
  "\n1) Abre esta URL en tu navegador e inicia sesión con la cuenta que agendará las reuniones:\n",
);
console.log("   " + authUrl + "\n");
console.log(`2) Esperando la redirección en ${REDIRECT_URI} …\n`);

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith("/oauth2callback")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Falta el parámetro 'code'.");
    return;
  }
  try {
    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h2>✅ Listo. Ya puedes cerrar esta pestaña y volver a la terminal.</h2>",
    );
    console.log("\n✅ Tokens obtenidos. Copia esta línea a tu .env:\n");
    console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    if (!tokens.refresh_token) {
      console.log(
        "⚠️  No se recibió refresh_token. Revoca el acceso de la app en\n" +
          "   https://myaccount.google.com/permissions y vuelve a ejecutar el script.\n",
      );
    }
  } catch (err) {
    console.error("Error al intercambiar el código:", err);
    res.writeHead(500);
    res.end("Error al intercambiar el código. Revisa la terminal.");
  } finally {
    server.close();
  }
});

server.listen(PORT);
