import { createHttpLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { log } from "@/utils/logger";

const httpLink = createHttpLink({
  uri: "https://graphql.anilist.co",
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      log.error(
        `GraphQL error: ${graphQLErrors
          .map(({ message, locations, path }) => {
            return `[Message]: ${message}, [Location]: ${locations}, [Path]: ${path}`;
          })
          .join(", ")}`
      );
    }
  }
);

export default errorLink.concat(httpLink);
export { httpLink, errorLink };
