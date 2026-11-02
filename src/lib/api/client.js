// Browser helper only; credentials and database drivers are never imported here.
export async function requestJson(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "The request failed. Please try again.");
  return body;
}
