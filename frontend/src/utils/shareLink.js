export function encodeTemplateResponse(obj) {
  const json = JSON.stringify(obj);
  // URL-safe base64
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeTemplateResponse(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const json = decodeURIComponent(escape(atob(b64 + pad)));
  return JSON.parse(json);
}