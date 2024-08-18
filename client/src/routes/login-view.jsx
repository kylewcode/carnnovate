import { useEffect } from "react";
import {
  Form,
  useActionData,
  useOutletContext,
  Link,
  Navigate,
} from "react-router-dom";

import { apiConfig } from "../../config";

export async function action({ request }) {
  const formData = await request.formData();

  const response = await fetch(`${apiConfig.endpoint}/login`, {
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
      <div className="loginpage-layout">
        <Form method="post" encType="multipart/form-data">
          <div className="input-wrapper">
            <label htmlFor="username">User Name</label>
            <input type="text" id="username" name="username" />
          </div>
          <div className="input-wrapper">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" />
          </div>
          <button type="submit" className="content-button">
            Login
          </button>
        </Form>

        <Link to={`request-password-reset`}>Forgot/Reset Password</Link>
      </div>
    );
  }

  if (authorization === "authorized") {
    return <Navigate to="/profile" replace />;
  }
}
