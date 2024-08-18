import { Form, redirect } from "react-router-dom";

import { apiConfig } from "../../config";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch(`${apiConfig.endpoint}/register`, {
    method: "POST",
    body: formData,
  });
  window.alert("You're all signed up! Go ahead and login on the next page.");

  return redirect("/login");
}

export default function Register() {
  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="registerpage-layout"
    >
      <label htmlFor="user-name">Username</label>
      <input
        type="text"
        id="user-name"
        name="user-name"
        placeholder="Enter your username"
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter you email"
      />

      <label htmlFor="password-1">Password</label>
      <input
        type="password"
        id="password-1"
        name="password-1"
        placeholder="Enter a password"
      />

      <label htmlFor="password-2">Password</label>
      <input
        type="password"
        id="password-2"
        name="password-2"
        placeholder="Reenter your password"
      />

      <button type="submit" className="content-button">
        Submit
      </button>
    </Form>
  );
}
