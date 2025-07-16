import { gql } from "graphql-request";

const queryBody = `
        id
        siteUrl
        title {
          userPreferred
          english
          native
          romaji
        }
        synonyms
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        format
        source
        status
        episodes
        duration
        averageScore
        popularity
        favourites
        description
        season
        seasonYear
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        studios {
          nodes {
            id
            name
          }
        }
        genres
        tags {
          name
          isMediaSpoiler
          rank
        }
        trailer {
          id
          site
          thumbnail
        }
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
`;

export function getGQLQuery(action: "search" | "fetch") {
  const variable = action === "search" ? "$query: String" : "$id: Int";
  const mediaType = action === "search" ? "search: $query" : "id: $id";

  return gql`
    query (${variable}) {
      Media(${mediaType}, type: ANIME) {
        ${queryBody}
      }
    }
  `;
}

export const topQuery = gql`
  query {
    Page(perPage: 10) {
      media(type: ANIME, sort: SCORE_DESC) {
        ${queryBody}
      }
    }
  }
`;

export const listQuery = gql`
  query ($userName: String, $type: MediaType) {
    MediaListCollection(userName: $userName, type: $type) {
      lists {
        name
        entries {
          media {
            ${queryBody}
          }
          progress
          score
          startedAt {
            month
            year
          }
          status
        }
      }
    }
  }
`;
