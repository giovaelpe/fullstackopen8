import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Loginform from "./components/Loginform";
import { useApolloClient, useSubscription } from "@apollo/client";
import Recomended from "./components/Recomended";
import { ALL_BOOKS, BOOK_ADDED } from "./services/queries";
import { Alert } from "react-bootstrap";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();
  const [alertMessage, setAlertMessage] = useState(null);

  const showAlertMessage = (text) => {
    setAlertMessage(text);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      showAlertMessage("Libro agregado!");
      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        };
      });
    },
  });

  const logout = () => {
    localStorage.clear();
    setToken(null);
    client.resetStore();
    setPage("authors");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("tokenForLibrary");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div>
      {alertMessage && <Alert variant="success">{alertMessage}</Alert>}
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recomended")}>recomended</button>
        )}
        {!token ? (
          <button onClick={() => setPage("login")}>Login</button>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>

      <Authors token={token} show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Loginform
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
      />
      <Recomended show={page === "recomended"} />
    </div>
  );
};

export default App;
