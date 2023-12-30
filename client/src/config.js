const environment = import.meta.env.MODE;

// Development mode configuration (default)
let apiUrl = import.meta.env.VITE_API_URL_DEV;
let portalUrl = import.meta.env.VITE_PORTAL_URL_DEV;

if (environment === "production") {
  apiUrl = import.meta.env.VITE_API_URL_PROD;
  portalUrl = import.meta.env.VITE_PORTAL_URL_PROD;
}

export { apiUrl, environment, portalUrl };
