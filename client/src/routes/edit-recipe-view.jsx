import { useState, useEffect } from "react";
import {
  Form,
  useParams,
  Navigate,
  useNavigate,
  useOutletContext,
  useNavigation,
} from "react-router-dom";

import { apiConfig } from "../../config";
import { deleteRecipe, getRecipe } from "../utils/ajax";

import placeholderImg from "../img/dummy-meal-image-600x400.png";

export async function action({ params, request }) {
  const formData = await request.formData();

  await fetch(`${apiConfig.endpoint}/update-recipe/${params.recipeId}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  window.alert("Recipe updated");

  return null;
}

export default function EditRecipe({ FilePond }) {
  const recipeId = useParams().recipeId;
  const navigate = useNavigate();
  const [authorization, setAuthorization] = useOutletContext();
  const [recipeDetails, setRecipeDetails] = useState({});
  const [files, setFiles] = useState([]);
  const [imageUploadStatus, setImageUploadStatus] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const navigation = useNavigation();
  const submitText =
    navigation.state === "submitting"
      ? "Updating..."
      : navigation.state === "loading"
      ? "Updated"
      : imageUploadStatus === "uploading"
      ? "Uploading..."
      : "Update";

  useEffect(() => {
    const getRecipeDetails = async () => {
      const { details } = await getRecipe(recipeId);

      setRecipeDetails(details);
    };

    getRecipeDetails();
  }, [recipeId]);

  const handleClick = async () => {
    if (window.confirm("Do you really want to delete this recipe?")) {
      const message = await deleteRecipe(recipeId);

      console.log(message);

      navigate("/profile");
    }
  };

  if (authorization === "authorized" && !recipeDetails.title) {
    return <div>Loading recipe...</div>;
  }

  if (authorization === "authorized" && recipeDetails.title) {
    return (
      <div className="editpage-layout">
        <h2>Edit Recipe</h2>
        <Form method="post" encType="multipart/form-data">
          <label htmlFor="title">
            Title
            <span style={{ color: "red" }}>
              Angle brackets &lt; &gt; are not allowed.
            </span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={recipeDetails.title}
            minLength={3}
            maxLength={75}
            pattern="^[a-zA-Z0-9 .,!?:;\(\)\-]+$"
            required
            autoFocus
          />

          <p>Current image</p>
          <img
            src={recipeDetails.image ? recipeDetails.image : placeholderImg}
            alt={recipeDetails.title}
          />
          <input
            type="hidden"
            name="old_image_url"
            value={recipeDetails.image || ""}
          />
          <input
            type="hidden"
            name="old_thumbnail_url"
            value={recipeDetails.thumbnail || ""}
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
            defaultValue={recipeDetails.description}
            minLength={10}
            maxLength={1000}
            pattern="^[^<>]*$"
            required
          ></textarea>

          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            name="ingredients"
            id="ingredients"
            cols="30"
            rows="10"
            defaultValue={recipeDetails.ingredients}
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
            defaultValue={recipeDetails.instructions}
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
            defaultValue={recipeDetails.time}
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
          <button
            type="button"
            className="content-button"
            onClick={handleClick}
          >
            Delete
          </button>
        </Form>
      </div>
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
