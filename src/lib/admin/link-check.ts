import "server-only";
import { toDisplayImageUrl } from "@/lib/drive";

const TIMEOUT_MS = 8000;

async function probe(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // GET with a tiny range: some hosts (including Google) reject HEAD.
    return await fetch(url, { method: "GET", headers: { Range: "bytes=0-1023" }, redirect: "follow", signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

/** Confirms that an image link is publicly reachable and really serves an image. */
export async function checkImageAccessible(raw: string): Promise<string | null> {
  const url = toDisplayImageUrl(raw);
  if (!url) return "Invalid image link.";
  try {
    const res = await probe(url);
    const type = res.headers.get("content-type") ?? "";
    if (res.url.includes("accounts.google.com") || res.status === 401 || res.status === 403)
      return "This image is not public. In Google Drive set sharing to “Anyone with the link → Viewer”.";
    if (res.status === 404) return "Image not found (404). Check the link.";
    if (!res.ok) return `The image link returned an error (${res.status}).`;
    if (!type.startsWith("image/")) return "This link opens a web page, not an image. Use a direct image link or a Drive file link.";
    return null;
  } catch {
    return "Could not reach this link (timed out or blocked).";
  }
}

/** Confirms that a Google Drive folder is shared publicly. */
export async function checkDriveFolderAccessible(url: string): Promise<string | null> {
  try {
    const res = await probe(url);
    if (res.url.includes("accounts.google.com") || res.status === 401 || res.status === 403)
      return "This Drive folder is private. Share it as “Anyone with the link → Viewer” if visitors should see it, or remove the link.";
    if (res.status === 404) return "Drive folder not found (404).";
    if (!res.ok) return `The folder link returned an error (${res.status}).`;
    return null;
  } catch {
    return "Could not reach this folder link (timed out or blocked).";
  }
}
