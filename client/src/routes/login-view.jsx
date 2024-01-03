import { Form } from "react-router-dom";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch("http://localhost:3000/login", {
    method: "POST",
    body: formData,
  });

  return null;
}

export default function Login() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="username">User Name</label>
      <input type="text" id="username" name="username" />

      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />

      <button type="submit">Login</button>
    </Form>
  );
}
