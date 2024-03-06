import { useEffect } from "react";
import {
  Form,
  useActionData,
  useOutletContext,
  Link,
  Navigate,
} from "react-router-dom";

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
  const [authorization, setAuthorization] = useOutletContext();
  const isAuthorized = useActionData();

  useEffect(() => {
    if (isAuthorized) {
      setAuthorization("authorized");
    } else {
      setAuthorization("unauthorized");
    }
  }, [setAuthorization, isAuthorized]);

  if (authorization === "unauthorized" || authorization === "authorizing") {
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

  if (authorization === "authorized") {
    return <Navigate to="/profile" replace />;
  }
}
