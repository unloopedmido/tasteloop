import Express, { type Request, type Response } from "express";
import type { Anime } from "../types";
import { structuredTheme } from "./utils/funcs";
import * as FS from "fs/promises";
import Path from "path";

const App = Express();
const Port = Number(Bun.env.SERVER_PORT ?? 3000);
const datasetPath = Bun.env.DATASET_PATH ?? "dataset.json";
let Dataset: Anime[] = [];

try {
  const stat = await FS.stat(datasetPath);
  if (stat.size > 1024) {
    await FS.mkdir("backups", { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    await FS.copyFile(datasetPath, `backups/dataset-${ts}.json`);
  }
} catch {}
try {
  Dataset = (await Bun.file(datasetPath).json()) as Anime[];
} catch {
  Dataset = [];
}

App.set("views", Path.join(__dirname, "views"));
App.set("view engine", "ejs");
App.use(Express.static("public"));

App.get("/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

App.get("/", (req, res) => {
  const q = (req.query.q as string | undefined)?.trim() || "";
  let list = Dataset;
  if (q) {
    const needle = q.toLowerCase();
    list = Dataset.filter((a) => {
      const haystack = [
        a.title,
        a.title_english ?? "",
        a.title_japanese ?? "",
        ...(a.title_synonyms || []),
        ...(a.genres?.map((g) => g.name) || []),
      ]
        .join(" | ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }
  res.render("index", { dataset: list, q });
});

App.get("/anime/:id", (req, res) => {
  res.render("info", {
    anime: Dataset.find((a) => a.mal_id == parseInt(req.params.id!)),
    structuredTheme,
  });
});

async function getAnimeTheme(req: Request, res: Response) {
  const rawId = req.params.id;
  const rawType = (req.params.type || "").toLowerCase();
  const rawNum = req.params.num;

  const id = Number.parseInt(rawId ?? "", 10);
  if (!Number.isInteger(id)) return res.status(400).send("Invalid anime id");

  if (rawType !== "opening" && rawType !== "ending") {
    return res.status(400).send("type must be 'opening' or 'ending'");
  }

  const num = rawNum !== undefined ? Number(rawNum) : undefined;
  if (rawNum !== undefined && (!Number.isInteger(num!) || num! < 1)) {
    return res.status(400).send("Invalid theme number");
  }

  const anime = Dataset.find((a) => a.mal_id === id);
  if (!anime) return res.status(404).send("Anime not found");

  const openings = (anime.themes?.openings ?? []).map(structuredTheme);
  const endings = (anime.themes?.endings ?? []).map(structuredTheme);
  const list = rawType === "opening" ? openings : endings;

  const localTheme =
    num !== undefined
      ? list.find((t: any) => String(t.prefix) === String(num)) ?? list[0]
      : list[0];

  if (!localTheme) return res.status(404).send("Theme not found");

  try {
    const animeUrl = new URL("https://api.animethemes.moe/anime");
    animeUrl.searchParams.set("filter[anime][name]", anime.title);
    animeUrl.searchParams.set("include", "animethemes.song.artists");

    const animeThemeReq = await fetch(animeUrl);
    if (!animeThemeReq.ok) {
      return res.status(502).send("Failed to fetch anime themes");
    }
    const animeThemeData = (await animeThemeReq.json()) as {
      anime: { animethemes: any[] }[];
    };

    const allThemes = animeThemeData.anime?.[0]?.animethemes ?? [];
    const filtered = allThemes.filter((t: any) =>
      rawType === "opening" ? t.type === "OP" : t.type === "ED"
    );

    if (filtered.length === 0) {
      return res.render("theme", {
        anime,
        theme: localTheme,
        type: rawType === "opening" ? "Opening" : "Ending",
        link: undefined,
      });
    }

    const selected =
      num !== undefined
        ? filtered.find((a: any) => a.sequence === num) ?? filtered[0]
        : filtered[0];

    if (!selected?.id) {
      return res.render("theme", {
        anime,
        theme: localTheme,
        type: rawType === "opening" ? "Opening" : "Ending",
        link: undefined,
      });
    }

    const selectedUrl = new URL(
      `https://api.animethemes.moe/animetheme/${selected.id}`
    );
    selectedUrl.searchParams.set("include", "animethemeentries.videos");

    const selectedReq = await fetch(selectedUrl);
    if (!selectedReq.ok) {
      return res.status(502).send("Failed to fetch selected theme");
    }
    const selectedData = (await selectedReq.json()) as {
      animetheme: { animethemeentries?: any[] };
    };

    const videos =
      selectedData.animetheme?.animethemeentries?.flatMap(
        (entry: any) => entry.videos ?? []
      ) ?? [];

    return res.render("theme", {
      anime,
      theme: localTheme,
      type: rawType === "opening" ? "Opening" : "Ending",
      link: videos[0]?.link,
    });
  } catch (err) {
    return res.status(502).send("Upstream service error");
  }
}

App.get("/anime/:id/:type{/:num}", async (req, res) => {
  await getAnimeTheme(req, res);
});

App.listen(Port, () => console.log(`Server running on port ${Port}`));
