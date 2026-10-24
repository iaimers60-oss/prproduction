export type VideoSource =
  | { kind: "youtube"; id: string; embed: string; poster: string }
  | { kind: "vimeo"; id: string; embed: string; poster: null }
  | { kind: "file"; src: string }
  | { kind: "external"; href: string };

export function parseVideoUrl(url: string | null | undefined): VideoSource | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let yt: string | null = null;
  if (host === "youtu.be") yt = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") yt = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
      if (m) yt = m[1];
    }
  }
  if (yt && /^[\w-]{6,}$/.test(yt)) {
    return {
      kind: "youtube",
      id: yt,
      embed: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`,
      poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{6,})/);
    if (m) return { kind: "vimeo", id: m[1], embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, poster: null };
  }
  if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  return { kind: "external", href: u.toString() };
}
