/** Utilitaires sans dépendance serveur (utilisables côté navigateur). */
export function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www\.|m\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com") id = u.searchParams.get("v") ?? (u.pathname.match(/\/(embed|shorts)\/([\w-]+)/)?.[2] ?? null);
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (host === "vimeo.com") {
      const v = u.pathname.match(/\/(\d+)/)?.[1];
      if (v) return `https://player.vimeo.com/video/${v}`;
    }
  } catch {}
  return null;
}
