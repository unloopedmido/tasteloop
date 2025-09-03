export function structuredTheme(input: string) {
  if (!input || typeof input !== "string") return null;

  const s = input.trim();
  const prefixMatch = s.match(/^\s*([^:]*)\s*:\s*/);
  let prefix: string | null = null;
  let rest: string;
  if (prefixMatch) {
    prefix = prefixMatch[1]?.trim() || null;
    rest = s.slice(prefixMatch[0].length).trim();
  } else {
    rest = s;
  }

  let epsRaw: string | null = null;
  const epsMatch = rest.match(/\(eps\s*([^)]+)\)\s*$/i);
  if (epsMatch) {
    epsRaw = epsMatch[1]!.trim();
    rest = rest.slice(0, epsMatch.index).trim();
  }

  let title = "";
  let artistPart = "";
  const quotedTitleMatch = rest.match(/^"([^"]+)"/);
  if (quotedTitleMatch) {
    title = quotedTitleMatch[1]!.trim();
    artistPart = rest.slice(quotedTitleMatch[0].length).trim().replace(/^by\s+/i, "");
  } else {
    const byIndex = rest.search(/\sby\s/i);
    if (byIndex !== -1) {
      title = rest.slice(0, byIndex).trim();
      artistPart = rest.slice(byIndex + 4).trim();
    } else {
      title = rest;
    }
  }

  const jpRegex = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
  const extractJP = (text: string) => {
    const parens = text.match(/\(([^)]+)\)/g) || [];
    let jp: string | undefined;
    let cleaned = text;
    for (const p of parens) {
      const inside = p.slice(1, -1).trim();
      if (jpRegex.test(inside) && !jp) jp = inside;
      cleaned = cleaned.replace(p, "");
    }
    cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/^[,\/\s]+|[,\/\s]+$/g, "");
    return { cleaned, jp };
  };

  const titleExtract = extractJP(title);
  const artistExtract = extractJP(artistPart);
  const artist = artistExtract.cleaned.replace(/^by\s+/i, "").trim();

  let episodes;
  if (epsRaw) {
    episodes = epsRaw.split(/\s*,\s*/).map(part => {
      const m = part.match(/^(\d+)(?:-(\d+)?)?$/);
      if (!m) return null;
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : part.endsWith("-") ? null : from;
      return { from, to: to === null ? null : to || from };
    }).filter(Boolean);
    if (episodes.length === 0) episodes = undefined;
  }

  const result: any = {
    prefix,
    title: titleExtract.cleaned || title,
    artist,
  };
  if (titleExtract.jp) result.title_japanese = titleExtract.jp;
  if (artistExtract.jp) result.artist_japanese = artistExtract.jp;
  if (episodes) result.episodes = episodes;

  return result.title ? result : null;
}
