import { useState, useEffect } from "react";
import { Form, useParams, redirect } from "react-router-dom";

export async function action({ request, params }) {
  const formData = await request.formData();
  const password = formData.get("password");
  const passwordConfirmation = formData.get("password-confirmation");
  const token = params.token;
  formData.set("token", token);

  if (password !== passwordConfirmation) {
    throw "Passwords do not match.";
  }

  await fetch("http://localhost:3000/reset-password", {
    method: "POST",
    body: formData,
  }).then((res) => {
    window.alert("Password updated");
  });

  return redirect("/");
}

export default function PasswordReset() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { token } = useParams();

  useEffect(() => {
    const authorizeUser = async (token) => {
      const res = await fetch("http://localhost:3000/token-validation", {
        method: "POST",
        body: token,
        headers: {
          "Content-Type": "text/plain",
        },
      });

      const auth = await res.json();
      setIsAuthorized(auth.isAuthorized);
    };

    authorizeUser(token);
  }, [token]);

  if (isAuthorized) {
    return (
      <Form method="post" encType="multipart/form-data">
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
        <button type="submit">Change password</button>
      </Form>
    );
  }

  return null;
}
