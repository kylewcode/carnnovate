import { useState, useEffect } from "react";
import { Form, useParams, redirect } from "react-router-dom";

import { apiConfig } from "../../config";

import "../styles/password-reset.css";

export async function action({ request, params }) {
  const formData = await request.formData();
  const password = formData.get("password");
  const passwordConfirmation = formData.get("password-confirmation");
  const token = params.token;
  formData.set("token", token);

  if (password !== passwordConfirmation) {
    throw "Passwords do not match.";
  }

  await fetch(`${apiConfig.endpoint}/reset-password`, {
    method: "POST",
    body: formData,
  }).then(() => {
    window.alert("Password updated");
  });

  return redirect("/");
}

export default function PasswordReset() {
  const [tokenIsValid, setTokenIsValid] = useState(false);
  const { token } = useParams();

  useEffect(() => {
    const validateUser = async (token) => {
      const res = await fetch(`${apiConfig.endpoint}/token-validation`, {
        method: "POST",
        body: token,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      const auth = await res.json();

      setTokenIsValid(auth.isAuthorized);
    };

    validateUser(token);
  }, [token]);

  if (!tokenIsValid) {
    return <div>Validating token...</div>;
  }

  if (tokenIsValid) {
    return (
      <Form
        method="post"
        encType="multipart/form-data"
        className="passwordresetpage-layout"
      >
        <label htmlFor="password">Enter a new password</label>
        <input type="password" name="password" id="password" />
        <label htmlFor="password-confirmation">
          Enter password again to confirm
        </label>
        <input
          type="password"
          name="password-confirmation"
          id="password-confirmation"
        />
        <button type="submit" className="content-button">
          Change password
        </button>
      </Form>
    );
  }
}
