import { useQuery, useLazyQuery } from "@apollo/client";
import { ALL_BOOKS, ALL_GENRES } from "../services/queries";
import { Spinner } from "react-bootstrap";
import { useEffect } from "react";

const Books = (props) => {
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);
  const genres = useQuery(ALL_GENRES);

  useEffect(() => {
    getBooks();
  }, []);

  if (!props.show) {
    return null;
  }
  if (result.loading || genres.loading) {
    return <Spinner animation="border"></Spinner>;
  }

  const books = result.data.allBooks;

  const genresArranged = new Set(
    genres.data.allBooks.map((book) => book.genres).flat()
  );

  const filterBooks = (genre) => {
    if (genre) {
      getBooks({ variables: { genre }, fetchPolicy: "network-only" });
    } else {
      getBooks({ fetchPolicy: "network-only" });
    }
  };

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
            <th>genres</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {[...genresArranged].map((genre) => (
        <button key={genre} onClick={() => filterBooks(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => filterBooks()}>All genres</button>
    </div>
  );
};

export default Books;
