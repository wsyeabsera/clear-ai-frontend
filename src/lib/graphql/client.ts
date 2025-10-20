import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Handle network errors gracefully
    if (networkError.message.includes('Failed to fetch') || networkError.message.includes('400')) {
      console.warn('GraphQL server appears to be unavailable. Please ensure the backend server is running on port 4000.');
    }
  }
});

// Context link for adding headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  }
});

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:4000',
});

const wsLink = new GraphQLWsLink(createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000',
  connectionParams: {
    // Add any authentication or connection parameters here
  },
  shouldRetry: () => false, // Disable WebSocket retries to avoid console spam
}));

// Create HTTP link chain with error handling
const httpLinkWithErrorHandling = from([errorLink, authLink, httpLink]);

// Split link: HTTP for queries/mutations, WebSocket for subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLinkWithErrorHandling,
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getRequestHistory: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
      notifyOnNetworkStatusChange: false,
    },
    query: {
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
  },
});
