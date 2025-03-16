import { useQuery } from "@apollo/client";
import { ALL_BOOKS, USER_INFO } from "../services/queries";
import { Spinner } from "react-bootstrap";

export default function Recomended(props) {
  const user = useQuery(USER_INFO);
  const books = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }
  if (user.loading || books.loading) {
    return <Spinner animation="border"></Spinner>;
  }

  return (
    <>
      <h2>Recomendations for {user.data.me.username}</h2>
      <h6>Tu genero favorito es: {user.data.me.favoriteGenre}</h6>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks
            .filter((book) => book.genres.includes(user.data.me.favoriteGenre))
            .map((book) => {
              return (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
}
