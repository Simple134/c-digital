import crypto from "crypto";

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
    const data = {
      ...params,
      ...body,
      timestamp,
      recvWindow,
    };

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
      throw new Error(`Gestiono API Error: ${response.status} - ${errorText}`);
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
}
