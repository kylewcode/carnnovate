import { useEffect } from "react";
import {
  Form,
  useActionData,
  useOutletContext,
  Link,
  Navigate,
} from "react-router-dom";

import { apiConfig } from "../../config";

import "../styles/login-view.css";

export async function action({ request }) {
  const formData = await request.formData();

  const response = await fetch(`${apiConfig.endpoint}/login`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  // (auth.isAuthorized will be false 90%)(False. true)
  const auth = await response.json();
  console.log("Login action auth.isAuthorized is ", auth.isAuthorized);
  return auth.isAuthorized;
}

export default function Login() {
  // (authorization is false upon 1st page load 99%)(False "unauthorized")
  const [authorization, setAuthorization] = useOutletContext();
  console.log("Login authorization state is: ", authorization);
  // (isAuthorized is false on first page load 90%)(False undefined)
  const isAuthorized = useActionData();
  console.log("Login isAuthorized action data is: ", isAuthorized);

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
