const { ApolloServer } = require("@apollo/server");
const mongoose = require("mongoose");
const typeDefs = require("./typedefs.js");
const resolvers = require("./resolvers.js");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const { createServer } = require("http");
const WebSocket = require("ws");
const { useServer } = require("graphql-ws/use/ws");
require("dotenv").config();
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const jwt = require("jsonwebtoken");
const Users = require("./models/Users");

console.log("Conecting...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Contected to mongo"))
  .catch((error) => console.log(`Failed connection: ${error}`));

const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocket.Server({
  server: httpServer,
  path: "/",
});

useServer({ schema }, wsServer);
const server = new ApolloServer({ schema });

async function startServer() {
  await server.start();
  console.log("Server ok");
  app.use(
    express.json(),
    cors(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );
          const currentUser = await Users.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );
}

startServer();

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log("Graphql server ready");
});
