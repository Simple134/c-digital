import { NextRequest, NextResponse } from "next/server";
import { GestionoAPI } from "@/lib/gestiono";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const body = await request.json();
    const { data } = body;

    // Await params para Next.js 15+
    const { formId } = await params;

    if (!data) {
      return NextResponse.json(
        { error: "Faltan datos del formulario" },
        { status: 400 },
      );
    }

    if (!formId || formId === "undefined" || isNaN(Number(formId))) {
      return NextResponse.json(
        { error: "ID de formulario inválido", receivedFormId: formId },
        { status: 400 },
      );
    }

    // Inicializar API de Gestiono
    const publicKey = process.env.NEXT_PUBLIC_GESTIONO_PUBLIC_KEY;
    const privateKey = process.env.NEXT_PUBLIC_GESTIONO_SECRET_KEY;
    const organizationId = process.env.GESTIONO_ORGANIZATION_ID;

    if (!publicKey || !privateKey || !organizationId) {
      console.error("Faltan credenciales de Gestiono");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    const gestionoAPI = new GestionoAPI(publicKey, privateKey, organizationId);

    // Preparar datos para Gestiono
    const contactData = {
      ...data,
    };

    // Enviar a Gestiono usando submitForm
    const result = await gestionoAPI.submitForm({
      formId: Number(formId),
      data: contactData,
    });

    console.log("Formulario enviado a Gestiono:", result);

    return NextResponse.json(
      {
        success: true,
        message: "Formulario enviado correctamente",
        gestionoResponse: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al procesar formulario:", error);

    return NextResponse.json(
      {
        error: "Error al procesar el formulario",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
