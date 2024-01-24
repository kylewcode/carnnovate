import { useEffect } from "react";
import { Form, useActionData, useOutletContext, Link } from "react-router-dom";

export async function action({ request }) {
  const formData = await request.formData();

  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const auth = await response.json();

  return auth.isAuthorized;
}

export default function Login() {
  const [isLoggedIn, setIsLoggedIn] = useOutletContext();
  const isAuthorized = useActionData();

  useEffect(() => {
    if (isAuthorized === undefined) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(isAuthorized);
    }
  }, [setIsLoggedIn, isAuthorized]);

  return (
    <>
      <Form method="post" encType="multipart/form-data">
        <label htmlFor="username">User Name</label>
        <input type="text" id="username" name="username" />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <button type="submit">Login</button>
      </Form>
      <Link to={`request-password-reset`}>Forgot/Reset Password</Link>
    </>
  );
}
