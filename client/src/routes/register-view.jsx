import { Form } from "react-router-dom";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch("http://localhost:3000/register", {
    method: "POST",
    body: formData,
  });

  return null;
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
        defaultValue="DeadNewbie"
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter you email"
        defaultValue="example@example.com"
      />

      <label htmlFor="password-1">Password</label>
      <input
        type="password"
        id="password-1"
        name="password-1"
        placeholder="Enter a password"
        defaultValue="rammarammadingdong"
      />

      <label htmlFor="password-2">Password</label>
      <input
        type="password"
        id="password-2"
        name="password-2"
        placeholder="Reenter your password"
        defaultValue="rammarammadingdong"
      />

      <button type="submit">Submit</button>
    </Form>
  );
}
