import { Form, redirect } from "react-router-dom";

export async function action({ request }) {
  // const formData = await request.formData();

  // await fetch("http://localhost:3000/register", {
  //   method: "POST",
  //   body: formData,
  // });
  window.alert("You're all signed up! Go ahead and login on the next page.");

  return redirect("/login");
}

export default function Register() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="user-name">User Name</label>
      <input
        type="text"
        id="user-name"
        name="user-name"
        placeholder="Enter your name"
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

      <button type="submit">Submit</button>
    </Form>
  );
}
