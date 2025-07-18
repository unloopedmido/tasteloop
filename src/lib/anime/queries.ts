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

export const searchQuery = gql`
  query ($query: String, $page: Int = 1, $perPage: Int = 10) {
    Page(page: $page, perPage: $perPage) {
      media(search: $query, type: ANIME) {
        ${queryBody}
      }
    }
  }
`;

export const fetchQuery = gql`
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${queryBody}
    }
  }
`;

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
  query ($userId: Int, $type: MediaType) {
    MediaListCollection(userId: $userId, type: $type) {
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

export const editQuery = gql`
  mutation (
    $animeId: Int
    $status: MediaListStatus
    $progress: Int
    $score: Float
  ) {
    SaveMediaListEntry(
      mediaId: $animeId
      status: $status
      progress: $progress
      score: $score
    ) {
      id
      status
      progress
      score
      updatedAt
    }
  }
`;
