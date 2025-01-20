import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ALL_AUTHORS, EDIT_BIRTHDATE } from "../services/queries";

export default function EditAuthorForm({ authors }) {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [editBorn] = useMutation(EDIT_BIRTHDATE, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  const submit = (e) => {
    e.preventDefault();
    editBorn({
      variables: { name, date: parseInt(born) },
    });
    setName("");
    setBorn("");
  };
  return (
    <div className="container">
      <h2>Set Birthyear</h2>
      <Form onSubmit={submit}>
        <Form.Group>
          <Form.Select
            onChange={({ target }) => setName(target.value)}
            required
          >
            <option value="">Select author</option>
            {authors.map((author) => {
              return (
                <option value={author.name} key={author.name}>
                  {author.name}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="author-birthdate">born: </Form.Label>
          <Form.Control
            type="text"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Update Author
        </Button>
      </Form>
    </div>
  );
}
