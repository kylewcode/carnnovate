import { Form } from "react-router-dom";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch("http://localhost:3000/request-reset", {
    method: "POST",
    body: formData,
  });

  return null;
}

export default function RequestReset() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="email">Enter your email.</label>
      <input type="email" name="email" id="email" />

      <button type="submit">Submit</button>
    </Form>
  );
}
