import { useMutation } from "@apollo/client";
import { Button, Form } from "react-bootstrap";
import { LOGIN } from "../services/queries";
import { useEffect, useState } from "react";

export default function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
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
  };

  if (!props.show) {
    return null;
  }

  return (
    <>
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
