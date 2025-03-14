import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ALL_GENRES } from "../services/queries";
import { Spinner } from "react-bootstrap";
import { useState } from "react";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const genres = useQuery(ALL_GENRES);
  const [filter, setFilter] = useState(null);
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
          {books
            .filter((book) => (!filter ? true : book.genres.includes(filter)))
            .map((a) => (
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
        <button key={genre} onClick={() => setFilter(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => setFilter(null)}>All genres</button>
    </div>
  );
};

export default Books;
