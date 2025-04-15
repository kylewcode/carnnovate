import { useState } from "react";
import {
  Form,
  Navigate,
  redirect,
  useOutletContext,
  useNavigation,
} from "react-router-dom";

import { apiConfig } from "../../config";

export async function action({ request }) {
  const formData = await request.formData();

  await fetch(`${apiConfig.endpoint}/create`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  window.alert("Recipe submitted!");

  return redirect("/search");
}

export default function Create({ FilePond }) {
  const [authorization] = useOutletContext();
  const [files, setFiles] = useState([]);
  const navigation = useNavigation();
  const submitText =
    navigation.state === "submitting"
      ? "Submitting"
      : navigation.state === "loading"
      ? "Submitted"
      : "Submit";

  if (authorization === "authorized") {
    return (
      <Form
        method="post"
        encType="multipart/form-data"
        className="createpage-layout"
      >
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          minLength={3}
          maxLength={75}
          pattern="^[a-zA-Z0-9' \-]+$"
          required
        />

        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={false}
          allowFileTypeValidation={true}
          labelFileTypeNotAllowed="File type is invalid. Please please upload jpeg, png, or gif file types only."
          fileValidateTypeLabelExpectedTypes="Expects {allButLastType} or {lastType}"
          acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
          server={{
            url: `${apiConfig.endpoint}/upload-images`,
            process: {
              withCredentials: true,
            },
          }}
          name="image"
          labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
        />

        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          cols="30"
          rows="10"
          placeholder="Enter a description..."
          minLength={10}
          maxLength={1000}
          pattern="^[a-zA-Z0-9' \-]+$"
          required
        ></textarea>

        <label htmlFor="ingredients">Ingredients</label>
        <textarea
          name="ingredients"
          id="ingredients"
          cols="30"
          rows="10"
          placeholder="Enter ingredients with a new line for each ingredient."
          required
          minLength={5}
          maxLength={1000}
        ></textarea>

        <label htmlFor="instructions">Instructions</label>
        <textarea
          name="instructions"
          id="instructions"
          cols="30"
          rows="10"
          placeholder="Enter instructions..."
          required
          minLength={10}
          maxLength={5000}
        ></textarea>

        <label htmlFor="time">Time (in minutes)</label>
        <input type="number" name="time" id="time" required min={1} max={300} />

        <button
          type="submit"
          className="content-button"
          disabled={navigation.state !== "idle"}
        >
          {submitText}
        </button>
      </Form>
    );
  }

  if (authorization === "unauthorized") {
    return (
      <div>
        <Navigate to="/login" replace />;
      </div>
    );
  }

  if (authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
