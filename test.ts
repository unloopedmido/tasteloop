import {
  fetchAnime,
  fetchAnimeList,
  fetcher,
  fetchTopAnime,
  searchAnime,
} from "@/lib/anime/fetch";

console.log(
  await fetcher({ type: "search", query: "Naruto", userId: "12345" })
);
// console.log(await searchAnime("Naruto"));
// console.log(await fetchAnimeList("nonlooped", "ANIME"));
// console.log(await fetchTopAnime());
