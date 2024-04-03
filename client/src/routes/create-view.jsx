import { Form, Navigate, redirect, useOutletContext } from "react-router-dom";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch("http://localhost:3000/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  window.alert("Recipe submitted!");

  return redirect("/search");
}

export default function Create() {
  const [authorization] = useOutletContext();

  if (authorization === "authorized") {
    return (
      <Form method="post" encType="multipart/form-data">
        <label htmlFor="title">Title</label>
        <input type="text" name="title" id="title" />

        <label htmlFor="image">Upload image</label>
        <input type="file" name="image" id="image" />

        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          cols="30"
          rows="10"
          placeholder="Enter a description..."
        ></textarea>

        <label htmlFor="ingredients">Ingredients</label>
        <textarea
          name="ingredients"
          id="ingredients"
          cols="30"
          rows="10"
          placeholder="Enter ingredients with a new line for each ingredient."
        ></textarea>

        <label htmlFor="instructions">Instructions</label>
        <textarea
          name="instructions"
          id="instructions"
          cols="30"
          rows="10"
          placeholder="Enter instructions..."
        ></textarea>

        <label htmlFor="time">Time (in minutes)</label>
        <input type="number" name="time" id="time" />

        <button type="submit">Submit</button>
      </Form>
    );
  }

  if (authorization === "unauthorized") {
    return (
      <div>
        <Navigate to="/login" replace />;
      </div>
    );
  }

  if (authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
