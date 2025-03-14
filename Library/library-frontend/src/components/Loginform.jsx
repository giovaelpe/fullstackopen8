import { useMutation } from "@apollo/client";
import { Button, Form, Alert } from "react-bootstrap";
import { LOGIN } from "../services/queries";
import { useEffect, useState } from "react";

export default function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");

  const showAlert = (message) => {
    setAlert(message);
    setTimeout(() => setAlert(""), 5000);
  };

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      showAlert(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      props.setToken(token);
      localStorage.setItem("tokenForLibrary", token);
      props.setPage("authors");
    }
  }, [result.data]);

  const submit = async (e) => {
    e.preventDefault();
    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  if (!props.show) {
    return null;
  }

  return (
    <>
      {alert && <Alert variant="warning">{alert}</Alert>}
      <Form onSubmit={submit}>
        <Form.Group>
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Clave</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Button type="submit">Log in</Button>
        </Form.Group>
      </Form>
    </>
  );
}
