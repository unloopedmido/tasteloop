import { authenticatedQuery } from "@/lib/auth";

const GET_LIST = `
  query ($status: MediaListStatus) {
    MediaListCollection(status: $status, type: ANIME) {
      lists {
        name
        entries { media { title { romaji } } }
      }
    }
  }
`;

const data = await authenticatedQuery("1129806570256089149", GET_LIST);
console.log(data);
