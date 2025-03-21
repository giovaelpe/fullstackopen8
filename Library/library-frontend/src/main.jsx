import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const authlink = setContext((_, { headers }) => {
  const token = localStorage.getItem("tokenForLibrary");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const link = new HttpLink({
  uri: "http://localhost:4000",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000",
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authlink.concat(link)
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
