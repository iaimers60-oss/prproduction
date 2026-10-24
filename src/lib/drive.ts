/**
 * Google Drive link helpers.
 *
 * A normal Drive sharing link (…/file/d/ID/view) is an HTML page, not an image.
 * For a *file* shared as "Anyone with the link", Google serves a resized copy at
 * lh3.googleusercontent.com/d/ID, which we use for display. Folder links are
 * never rendered as images; they power the "View Full Gallery" button.
 */

const FILE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/,
  /drive\.google\.com\/(?:open|uc|thumbnail)\?(?:.*&)?id=([a-zA-Z0-9_-]{10,})/,
  /docs\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]{10,})/,
  /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/,
];

const FOLDER_PATTERN = /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]{10,})/;

export function extractDriveFileId(url: string): string | null {
  for (const p of FILE_PATTERNS) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function extractDriveFolderId(url: string): string | null {
  return url.match(FOLDER_PATTERN)?.[1] ?? null;
}

export function isDriveUrl(url: string): boolean {
  return /(^|\.)(drive|docs)\.google\.com$/.test(safeHost(url) ?? "");
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Convert any supported image URL into one a browser can render.
 * Drive file links become lh3.googleusercontent.com URLs; other URLs pass through.
 */
export function toDisplayImageUrl(url: string | null | undefined, width = 2000): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isDriveUrl(trimmed) || trimmed.includes("lh3.googleusercontent.com/d/")) {
    const id = extractDriveFileId(trimmed);
    return id ? `https://lh3.googleusercontent.com/d/${id}=w${width}` : null;
  }
  return trimmed;
}

export type LinkCheck = { ok: true } | { ok: false; error: string };

/** Synchronous format check for an image URL entered by the admin. */
export function validateImageUrlFormat(url: string): LinkCheck {
  const host = safeHost(url);
  if (!host || !/^https:\/\//.test(url)) return { ok: false, error: "Image links must be full https:// URLs." };
  if (extractDriveFolderId(url))
    return { ok: false, error: "This is a Drive folder link. Use the link of a single image file here, or put the folder link in “Google Drive folder URL”." };
  if (isDriveUrl(url) && !extractDriveFileId(url))
    return { ok: false, error: "Could not find a file ID in this Google Drive link. Use Share → Copy link on the image file." };
  return { ok: true };
}

/** Synchronous format check for a Drive folder URL. */
export function validateDriveFolderFormat(url: string): LinkCheck {
  if (!/^https:\/\//.test(url)) return { ok: false, error: "The folder link must start with https://." };
  if (!extractDriveFolderId(url))
    return { ok: false, error: "This does not look like a Google Drive folder link (expected drive.google.com/drive/folders/…)." };
  return { ok: true };
}
