// Public configuration is embedded during the Cloudflare build.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://yosef-api.hunterwilson.dev"
).replace(/\/+$/, "");
