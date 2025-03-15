import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      born
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

export const ALL_GENRES = gql`
  query {
    allBooks {
      genres
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!
    $author: AuthorInput!
    $published: Int!
    $genres: [String]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

export const EDIT_BIRTHDATE = gql`
  mutation editBirthDate($name: String!, $date: Int!) {
    editAuthor(name: $name, setBornTo: $date) {
      name
      born
    }
  }
`;

export const LOGIN = gql`
  mutation ($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const USER_INFO = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`;
