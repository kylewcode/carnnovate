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
  const [imageUploadStatus, setImageUploadStatus] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const navigation = useNavigation();
  const submitText =
    navigation.state === "submitting"
      ? "Submitting..."
      : navigation.state === "loading"
      ? "Submitted"
      : imageUploadStatus === "uploading"
      ? "Uploading..."
      : "Submit";

  if (authorization === "authorized") {
    return (
      <>
        <h2>Create Recipe</h2>
        <Form
          method="post"
          encType="multipart/form-data"
          className="createpage-layout"
        >
          <label htmlFor="title">
            Title{" "}
            <span style={{ color: "red" }}>
              Angle brackets &lt; &gt; are not allowed.
            </span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            minLength={3}
            maxLength={75}
            pattern="^[a-zA-Z0-9 .,!?:;\(\)\-]+$"
            required
            autoFocus
          />

          {uploadError !== "" ? <p>Upload failed: {uploadError}</p> : null}
          <FilePond
            files={files}
            onupdatefiles={setFiles}
            onaddfilestart={() => {
              setImageUploadStatus("uploading");
              setUploadError("");
            }}
            onprocessfiles={() => setImageUploadStatus("idle")}
            onerror={(error) => {
              setImageUploadStatus("idle");
              setUploadError(error.body);
            }}
            onprocessfileabort={() => setImageUploadStatus("idle")}
            allowMultiple={false}
            allowFileTypeValidation={true}
            labelFileTypeNotAllowed="File type is invalid. Please please upload jpeg, png, or gif file types only."
            fileValidateTypeLabelExpectedTypes="Expects {allButLastType} or {lastType}"
            acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
            maxFileSize="5MB"
            labelMaxFileSizeExceeded="File is too large"
            labelMaxFileSize="Maximum file size is {filesize}"
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
            minLength={10}
            maxLength={1000}
            pattern="^[^<>]*$"
            required
          ></textarea>

          <label htmlFor="ingredients">
            Ingredients. (Type each ingredient on a new line)
          </label>
          <textarea
            name="ingredients"
            id="ingredients"
            cols="30"
            rows="10"
            minLength={5}
            maxLength={1000}
            pattern="^[^<>]*$"
            placeholder="Ingredient 1&#13;Ingredient 2&#13;Ingredient 3&#13;etc."
            required
          ></textarea>

          <label htmlFor="instructions">
            Instructions (Use a numbered list.)
          </label>
          <textarea
            name="instructions"
            id="instructions"
            cols="30"
            rows="10"
            minLength={10}
            maxLength={5000}
            pattern="^[^<>]*$"
            placeholder="1. Prepare the carrots.&#13;2. Brown the meat.&#13;3. Bring water to a boil.&#13;4. etc..."
            required
          ></textarea>

          <label htmlFor="time">Time (in minutes)</label>
          <input
            type="number"
            name="time"
            id="time"
            required
            min={1}
            max={300}
          />

          <button
            type="submit"
            className="content-button"
            disabled={
              navigation.state !== "idle" || imageUploadStatus === "uploading"
            }
          >
            {submitText}
          </button>
        </Form>
      </>
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
