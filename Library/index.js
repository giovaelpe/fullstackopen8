const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Authors = require("./models/Authors");
const Books = require("./models/Books");
const Users = require("./models/Users");
const mongoose = require("mongoose");
const { GraphQLBoolean, GraphQLError } = require("graphql");
require("dotenv").config();

console.log("Conecting...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Contected to mongo"))
  .catch((error) => console.log(`Failed connection: ${error}`));

const typeDefs = `
  type Author {
    name : String!
    id: ID!
    born: Int
    bookCount: Int
  }
  input AuthorInput {
    name: String!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]
  }
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
  }
  type Mutation {
    addBook(title: String!, published: Int!, author: AuthorInput!, genres: [String]) : Book
    editAuthor(name: String!, setBornTo: Int!): Author
    addAuthor(name: String!, born: Int): Author
  }


  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
      password: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async (root, args) => {
      const allBooks = await Books.find({}).populate("author");
      if (args.genre) {
        return allBooks.filter((book) => book.genres.includes(args.genre));
      }
      return allBooks;
    },
    allAuthors: async () => Authors.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => Books.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const author = await Authors.findOne({ name: args.author.name });
      if (!author) {
        throw new GraphQLError("Author doesnt exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      if (!context.currentUser) {
        throw new GraphQLError("No está logeado", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const newBook = new Books({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      });
      if (newBook.title.length < 2) {
        throw new GraphQLError("Book's title is too short", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      await newBook.save();
      return newBook.populate("author");
    },
    addAuthor: async (root, args) => {
      const exists = Authors.findOne({ name: args.name });
      if (exists) {
        throw new GraphQLError("Author already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const newAuthor = new Authors({ ...args });
      if (newAuthor.name.length < 4) {
        throw new GraphQLError("Author's name is too short", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      await newAuthor.save();
      return newAuthor;
    },
    editAuthor: async (root, args, context) => {
      const { name, setBornTo } = args;
      const authorToUpdate = await Authors.findOne({ name: name });
      if (!authorToUpdate) {
        throw new GraphQLError("Author doesn't exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      if (!context.currentUser) {
        throw new GraphQLError("No está logeado", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      authorToUpdate.born = setBornTo;
      await authorToUpdate.save();
      return authorToUpdate;
    },
    createUser: async (root, args) => {
      const hash = await bcrypt.hash(args.password, parseInt(process.env.SALT));
      const user = new Users({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        password: hash,
      });
      user.save();
      return user;
    },

    login: async (root, args) => {
      const user = await Users.findOne({ username: args.username });
      if (!user) {
        throw new GraphQLError("User doesn't exist", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const match = await bcrypt.compare(args.password, user.password);
      if (!match) {
        throw new GraphQLError("Wrong Password", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForTojen = {
        username: user.username,
        id: user._id,
      };
      const token = jwt.sign(userForTojen, process.env.JWT_SECRET);
      return { value: token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
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
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
