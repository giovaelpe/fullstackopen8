const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

// Borrar
let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];
//Borrar

const Authors = require("./models/Authors");
const Books = require("./models/Books");
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
`;

const resolvers = {
  Query: {
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async () => Books.find({}).populate("author"), //Esta sin parametro autor
    allAuthors: async () => Authors.find({}),
  },
  Author: {
    bookCount: async (root) => Books.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Authors.findOne({ name: args.author.name });
      if (!author) {
        throw new GraphQLError("Author doesnt exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const newBook = new Books({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      });
      await newBook.save();
      return newBook;
    },
    addAuthor: async (root, args) => {
      const newAuthor = new Authors({ ...args });
      await newAuthor.save();
      return newAuthor;
    },
    editAuthor: async (root, args) => {
      const { name, setBornTo } = args;
      const authorToUpdate = await Authors.findOne({ name: name });
      authorToUpdate.born = setBornTo;
      await authorToUpdate.save();
      return authorToUpdate;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
