import crypto from "crypto";

/** Monedas que acepta Gestiono. CardNet solo liquida DOP; Stripe acepta el resto. */
export type GestionoCurrency = "DOP" | "USD" | "EUR";

/**
 * Línea de la factura.
 *
 * La doc declara `elements[]` como `unknown`, así que estos campos se
 * confirmaron contra la API real: enviar solo description/quantity/price
 * devuelve 400 con `{"field":"elements.0.unit","message":"Required"}`, y el
 * resto de campos no genera queja. `unit` es string libre (en el esquema de
 * `postResource` figura como `Type: string`, no como enum).
 *
 * Se deja passthrough de campos extra (impuestos, resourceId, descuentos) por
 * si el validador acepta más de lo que reporta.
 */
export interface GestionoInvoiceItem {
  description: string;
  quantity: number;
  price: number;
  /** Unidad de medida: "UNIT", "hora", "mes"… Requerido por Gestiono. */
  unit: string;
  /** Id del recurso/servicio en el catálogo de Gestiono, si aplica. */
  resourceId?: number;
  [key: string]: unknown;
}

/** Contacto inline: se crea el beneficiario junto con la factura. */
export interface GestionoInlineContact {
  name: string;
  type: string;
  taxId?: string;
  contact?: {
    type: string;
    data: string;
    dataType?: string;
  }[];
}

export interface CreatePaymentLinkInput {
  /** Sucursal/división contable. Requerido por Gestiono. */
  divisionId: number;
  currency: GestionoCurrency;
  items: GestionoInvoiceItem[];
  /** Cliente existente en Gestiono. Alternativa a `contact`. */
  beneficiaryId?: number;
  /** Crea el cliente al vuelo. Alternativa a `beneficiaryId`. */
  contact?: GestionoInlineContact;
  description?: string;
  /** Fecha de emisión, "YYYY-MM-DD". Si se omite, Gestiono usa hoy. */
  date?: string;
  /**
   * Vencimiento, "YYYY-MM-DD". Omitir si no hay uno real: Gestiono rechaza con
   * "Fecha de vencimiento invalida" un vencimiento que no sea posterior a la
   * emisión, así que pasar la fecha de emisión acá falla.
   */
  dueDate?: string;
  /** Nota que se muestra en la página de pago. */
  note?: string;
  /** Sobrescribe el nombre del emisor en la página de pago. */
  customOrganizationName?: string;
  /** Si se pasa, Gestiono envía el link por correo además de devolverlo. */
  sendToEmails?: string[];
}

export interface PaymentLinkResult {
  pendingRecordId: number;
  shareUrl: string;
  emailSent: boolean;
}

interface GestionoRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  endpoint: string;
  params?: Record<string, string | number>;
  body?: Record<string, unknown>;
}

export class GestionoAPI {
  private publicKey: string;
  private privateKey: string;
  private organizationId: string;
  private baseURL: string;

  constructor(publicKey: string, privateKey: string, organizationId: string) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.organizationId = organizationId;
    this.baseURL = "https://api.gestiono.app/v1";
  }

  private generateSignature(data: Record<string, unknown>): string {
    const dataString = JSON.stringify(data);
    return crypto
      .createHmac("sha256", this.privateKey)
      .update(dataString)
      .digest("hex");
  }

  async makeRequest({
    method,
    endpoint,
    params = {},
    body = {},
  }: GestionoRequestOptions) {
    const timestamp = Date.now();
    const recvWindow = 60000;

    // Combinar todos los datos para firmar
    const raw = {
      ...params,
      ...body,
      timestamp,
      recvWindow,
    };

    // En un GET todo viaja por query string, así que el servidor recibe cada
    // valor como texto: `timestamp` llega "1754…" y no 1754…. Si firmáramos los
    // números sin comillas, la firma no coincidiría con la que Gestiono
    // recalcula sobre `req.query` y responde 401 "Error api keys signature".
    // En POST el body va como JSON y los tipos se conservan, por eso ahí no
    // hace falta (y es la razón de que el envío de formularios sí funcione).
    const data: Record<string, unknown> =
      method === "GET"
        ? Object.fromEntries(
            Object.entries(raw).map(([k, v]) => [k, String(v)]),
          )
        : raw;

    const signature = this.generateSignature(data);

    // Construir query string para solicitudes GET
    const queryString =
      method === "GET"
        ? "?" +
          new URLSearchParams(
            Object.entries(data).map(([k, v]) => [k, String(v)]),
          ).toString()
        : "";

    const url = `${this.baseURL}${endpoint}${queryString}`;

    const headers: Record<string, string> = {
      "X-Bitnation-Apikey": this.publicKey,
      Authorization: signature,
      "Content-Type": "application/json",
      "X-Bitnation-Organization-Id": this.organizationId,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET") {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();

      // Gestiono devuelve los fallos de validación en `details[]` con el campo
      // exacto. Se despliegan en el mensaje para no tener que leer el JSON
      // crudo en cada error: "elements.0.unit: Required" dice todo.
      let detail = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (Array.isArray(parsed?.details) && parsed.details.length > 0) {
          const fields = parsed.details
            .map(
              (d: { field?: string; message?: string }) =>
                `${d.field ?? "?"}: ${d.message ?? "?"}`,
            )
            .join("; ");
          detail = `${parsed.msg ?? "Validación fallida"} → ${fields}`;
        } else if (parsed?.msg) {
          detail = parsed.msg;
        }
      } catch {
        // No era JSON: se deja el texto tal cual.
      }

      throw new Error(
        `Gestiono API Error ${response.status} en ${method} ${endpoint}: ${detail}`,
      );
    }

    return response.json();
  }

  async submitForm({
    formId,
    ...data
  }: {
    formId: number;
    [key: string]: unknown;
  }) {
    return this.makeRequest({
      method: "POST",
      endpoint: `/forms/${formId}/submit`,
      body: data,
    });
  }

  /**
   * Crea una factura (pending record) en Gestiono.
   * POST /v1/record/pending → { pendingRecordId }
   */
  async createInvoice(input: CreatePaymentLinkInput): Promise<number> {
    const body: Record<string, unknown> = {
      divisionId: input.divisionId,
      type: "INVOICE",
      isSell: true,
      currency: input.currency,
      elements: input.items,
    };

    if (input.beneficiaryId) body.beneficiaryId = input.beneficiaryId;
    if (input.contact) body.contact = input.contact;
    if (input.description) body.description = input.description;
    if (input.date) body.date = input.date;
    if (input.dueDate) body.dueDate = input.dueDate;

    const post = () =>
      this.makeRequest({
        method: "POST",
        endpoint: "/record/pending",
        body,
      });

    let result;
    try {
      result = await post();
    } catch (error) {
      // La fecha de emisión es un adorno: lo que importa es que la factura
      // exista para poder cobrarla. Gestiono valida `date` con reglas que no
      // documenta (rechaza "YYYY-MM-DD", y podría rechazar fechas antiguas), así
      // que si es lo único que estorba se reintenta sin ella y Gestiono usa hoy.
      const message = error instanceof Error ? error.message : "";
      const dateRejected = /\bdate\b/.test(message) && "date" in body;

      if (!dateRejected) throw error;

      console.warn(
        `Gestiono rechazó la fecha de emisión (${String(body.date)}); se reintenta sin ella.`,
      );
      delete body.date;
      result = await post();
    }

    const pendingRecordId = Number(
      result?.pendingRecordId ?? result?.data?.pendingRecordId,
    );

    if (!Number.isFinite(pendingRecordId)) {
      throw new Error(
        `Gestiono no devolvió pendingRecordId: ${JSON.stringify(result)}`,
      );
    }

    return pendingRecordId;
  }

  /**
   * Link de PAGO CON TARJETA (Stripe) de una factura.
   * GET /v1/record/pending/:pendingRecordId/pay/:organizationId
   *
   * Este endpoint es público y responde 302 hacia
   * `https://gestiono.app/shared/<uuid>`, creando de paso un "Shared item" de
   * `type: "payment-link"` que apunta a la factura (`referencedId`).
   *
   * Es la pieza que hace la diferencia: ese UUID es lo que aceptan los endpoints
   * de cobro (`/v1/shared/:id/payment-data`, `/create-intent`, `/pay-with-saved`).
   * El `shareId` en base64 que devuelve `…/share` NO sirve acá — esos endpoints
   * responden "Shared item not found", porque solo es un enlace para *ver* la
   * factura. Dos entidades distintas bajo la misma ruta `/shared/…`.
   *
   * Verificado contra la API: `payment-data` de un UUID así devuelve
   * `availableProviders: ["stripe"]`, `defaultCheckoutProvider: "stripe"` y
   * `paymentEnabled: true`.
   */
  async getPaymentLinkUrl(pendingRecordId: number): Promise<string> {
    // Endpoint público: sin firma ni API key. Se pide la redirección en modo
    // manual porque lo que necesitamos es el destino (`location`), no el HTML
    // de la página de pago.
    const url = `${this.baseURL}/record/pending/${pendingRecordId}/pay/${this.organizationId}`;
    const response = await fetch(url, { redirect: "manual" });
    const location = response.headers.get("location");

    if (!location) {
      throw new Error(
        `Gestiono no redirigió al link de pago (${response.status}) para la factura ${pendingRecordId}`,
      );
    }

    return location;
  }

  /**
   * Link para VER la factura (no para pagarla).
   * GET /v1/record/pending/:pendingRecordId/share
   *
   * Se conserva por si hace falta compartir la factura sin cobrar. Para cobrar
   * con tarjeta usá `getPaymentLinkUrl`.
   *
   * La doc dice que responde `"<shareUrl>"`, pero la respuesta real es un objeto
   * con tres formas del mismo enlace:
   *
   *   {
   *     "html":    "https://gestiono.app/shared/<shareId>",              // ← el link de pago
   *     "data":    "https://api.gestiono.app/v1/record/pending/<shareId>/data", // JSON crudo
   *     "shareId": "<base64>"
   *   }
   *
   * Devolvemos `html`: es la página donde Gestiono monta el checkout de Stripe
   * (`POST /v1/shared/:id/create-intent` → clientSecret). `data` es la API que
   * esa página consume — mandárselo a un cliente le mostraría JSON.
   *
   * El `shareId` es base64 de `{organizationId, id, note, customOrganizationName,
   * timestamp}`, con el instante de generación embebido. Si Gestiono lo usa para
   * caducar links, se regenera llamando de nuevo con el mismo `pendingRecordId`.
   */
  async getInvoiceShareUrl({
    pendingRecordId,
    note = "",
    customOrganizationName = "",
  }: {
    pendingRecordId: number;
    note?: string;
    customOrganizationName?: string;
  }): Promise<string> {
    // note y customOrganizationName son query params y por tanto van firmados;
    // pendingRecordId es path param y NO se firma.
    const result = await this.makeRequest({
      method: "GET",
      endpoint: `/record/pending/${pendingRecordId}/share`,
      params: { note, customOrganizationName },
    });

    const shareUrl =
      typeof result === "string"
        ? result
        : (result?.html ?? result?.shareUrl ?? result?.url);

    if (typeof shareUrl !== "string" || !shareUrl) {
      throw new Error(
        `Gestiono no devolvió el link de pago: ${JSON.stringify(result)}`,
      );
    }

    return shareUrl;
  }

  /**
   * Envía el link de pago por correo desde Gestiono.
   * POST /v1/record/pending/:pendingRecordId/share/email
   */
  async sendInvoiceShareEmail({
    pendingRecordId,
    emails,
    note = "",
    customOrganizationName = "",
  }: {
    pendingRecordId: number;
    emails: string[];
    note?: string;
    customOrganizationName?: string;
  }) {
    return this.makeRequest({
      method: "POST",
      endpoint: `/record/pending/${pendingRecordId}/share/email`,
      body: {
        emails: emails.join(","),
        email: emails[0],
        note,
        customOrganizationName,
      },
    });
  }

  /**
   * Flujo completo: factura → link de pago (→ correo opcional).
   *
   * El envío de correo es best-effort: si falla, el link ya existe y se
   * devuelve igual con `emailSent: false`, en vez de perder la factura creada.
   */
  async createPaymentLink(
    input: CreatePaymentLinkInput,
  ): Promise<PaymentLinkResult> {
    const pendingRecordId = await this.createInvoice(input);

    const shareUrl = await this.getPaymentLinkUrl(pendingRecordId);

    let emailSent = false;

    if (input.sendToEmails?.length) {
      try {
        await this.sendInvoiceShareEmail({
          pendingRecordId,
          emails: input.sendToEmails,
          note: input.note,
          customOrganizationName: input.customOrganizationName,
        });
        emailSent = true;
      } catch (error) {
        console.error(
          `No se pudo enviar el link de pago ${pendingRecordId} por correo:`,
          error,
        );
      }
    }

    return { pendingRecordId, shareUrl, emailSent };
  }
}
