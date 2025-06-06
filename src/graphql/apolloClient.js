// src/graphql/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// 1) Point this to your GraphQL endpoint:
const httpLink = createHttpLink({
    uri: "http://localhost:8079/query",
    // (If you need auth headers, add them under “headers:” here)
});

// 2) Initialize client with a basic in-memory cache:
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default client;
