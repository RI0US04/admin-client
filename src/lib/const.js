const sslEnabled = import.meta.env.VITE_API_SSL_ENABLED === 'true';

const baseHttp = `http${sslEnabled ? "s" : ""}`

const adminApiEndpoint = import.meta.env.VITE_ADMIN_API_ENDPOINT;
export const ADMIN_HTTP_API_ENDPOINT = `${baseHttp}://${adminApiEndpoint}`

export const CLOUDFLARE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_SITE_KEY