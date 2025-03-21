const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Authors = require("./models/Authors");
const Books = require("./models/Books");
const Users = require("./models/Users");
const { GraphQLError, subscribe } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubSub = new PubSub();

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
      pubSub.publish("BOOK_ADDED", { bookAdded: newBook });
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubSub.asyncIterableIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
