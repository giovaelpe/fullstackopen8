import { useQuery } from "@apollo/client";
import { ALL_AUTHORS } from "../services/queries";
import { Spinner } from "react-bootstrap";
import EditAuthorForm from "./EditAuthorForm";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  if (!props.show) {
    return null;
  }
  if (result.loading) {
    return <Spinner animation="border"></Spinner>;
  }
  const authors = result.data.allAuthors;
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token && <EditAuthorForm authors={authors} />}
    </div>
  );
};

export default Authors;
