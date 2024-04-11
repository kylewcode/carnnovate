import { Form } from "react-router-dom";

import { apiConfig } from "../../config";

import "../styles/request-reset.css";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch(`${apiConfig.endpoint}/request-reset`, {
    method: "POST",
    body: formData,
  });

  window.alert(
    "A link to reset your password has been sent to your account email."
  );

  return null;
}

export default function RequestReset() {
  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="requestresetpage-layout"
    >
      <label htmlFor="email">Enter your email.</label>
      <input type="email" name="email" id="email" />

      <button type="submit" className="content-button">
        Submit
      </button>
    </Form>
  );
}
