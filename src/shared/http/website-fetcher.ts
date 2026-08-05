// src/shared/http/website-fetcher.ts
import axios, { type AxiosInstance } from 'axios';
import * as tls from 'node:tls';
import { URL } from 'node:url';

export interface WebsiteFetchResult {
  url: string;
  html: string;
  loadTimeMs: number;
  sslValid: boolean;
  sslIssuer: string | null;
}

const hostLastFetchAt = new Map<string, number>();
const MIN_HOST_INTERVAL_MS = 250;

export class WebsiteFetcher {
  constructor(
    private readonly http: AxiosInstance = axios.create({
      timeout: 10_000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'BusinessProspectFinder/1.0',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    }),
  ) {}

  async fetch(websiteUri: string): Promise<WebsiteFetchResult> {
    const url = normalizeUrl(websiteUri);
    await throttleHost(url.hostname);

    const startedAt = Date.now();
    const response = await this.http.get<string>(url.toString(), {
      responseType: 'text',
    });
    const loadTimeMs = Date.now() - startedAt;

    const ssl = await inspectSsl(url);

    return {
      url: url.toString(),
      html: typeof response.data === 'string' ? response.data : '',
      loadTimeMs,
      sslValid: ssl.valid,
      sslIssuer: ssl.issuer,
    };
  }
}

function normalizeUrl(websiteUri: string): URL {
  if (websiteUri.startsWith('http://') || websiteUri.startsWith('https://')) {
    return new URL(websiteUri);
  }
  return new URL(`https://${websiteUri}`);
}

async function throttleHost(hostname: string): Promise<void> {
  const last = hostLastFetchAt.get(hostname) ?? 0;
  const waitMs = MIN_HOST_INTERVAL_MS - (Date.now() - last);
  if (waitMs > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, waitMs);
    });
  }
  hostLastFetchAt.set(hostname, Date.now());
}

function readIssuer(issuer: tls.PeerCertificate['issuer']): string | null {
  if (!issuer || typeof issuer !== 'object') {
    return null;
  }

  const value = issuer.O ?? issuer.CN ?? null;
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

async function inspectSsl(
  url: URL,
): Promise<{ valid: boolean; issuer: string | null }> {
  if (url.protocol !== 'https:') {
    return { valid: false, issuer: null };
  }

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: url.hostname,
        port: Number(url.port || 443),
        servername: url.hostname,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        const issuer = readIssuer(cert.issuer);
        socket.end();
        resolve({ valid: authorized, issuer });
      },
    );

    socket.setTimeout(5_000, () => {
      socket.destroy();
      resolve({ valid: false, issuer: null });
    });

    socket.on('error', () => {
      resolve({ valid: false, issuer: null });
    });
  });
}
