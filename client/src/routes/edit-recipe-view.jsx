import { useState, useEffect } from "react";
import {
  Form,
  useParams,
  Navigate,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import { apiConfig } from "../../config";
import { deleteRecipe } from "../utils/ajax";

import "../styles/edit-view.css";

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

export default function EditRecipe() {
  const recipeId = useParams().recipeId;
  const navigate = useNavigate();
  const [authorization, setAuthorization] = useOutletContext();
  const [recipeDetails, setRecipeDetails] = useState({});

  useEffect(() => {
    const getRecipeDetails = async () => {
      const res = await fetch(
        `${apiConfig.endpoint}/get-recipe-details/${recipeId}`
      );
      const recipeDetails = await res.json();

      setRecipeDetails(recipeDetails);
    };

    getRecipeDetails();
  }, [recipeId]);

  const handleClick = async () => {
    // Prompt
    if (window.confirm("Do you really want to delete this recipe?")) {
      // Delete recipe
      const message = await deleteRecipe(recipeId);
      console.log(message);
      // Navigate user to profile
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
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={recipeDetails.title}
          />

          <label htmlFor="image">Upload image</label>
          <input type="file" name="image" id="image" />

          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            cols="30"
            rows="10"
            defaultValue={recipeDetails.description}
          ></textarea>

          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            name="ingredients"
            id="ingredients"
            cols="30"
            rows="10"
            defaultValue={recipeDetails.ingredients}
          ></textarea>

          <label htmlFor="instructions">Instructions</label>
          <textarea
            name="instructions"
            id="instructions"
            cols="30"
            rows="10"
            defaultValue={recipeDetails.instructions}
          ></textarea>

          <label htmlFor="time">Time (in minutes)</label>
          <input
            type="number"
            name="time"
            id="time"
            defaultValue={recipeDetails.time}
          />

          <button type="submit" className="content-button">
            Update recipe
          </button>
          <button
            type="button"
            className="content-button"
            onClick={handleClick}
          >
            Delete recipe
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
