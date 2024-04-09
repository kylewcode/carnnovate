import { useState, useEffect } from "react";
import { Form, useParams, Navigate, useOutletContext } from "react-router-dom";

import "../styles/edit-view.css";

export async function action({ params, request }) {
  const formData = await request.formData();

  await fetch(`http://localhost:3000/update-recipe/${params.recipeId}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  window.alert("Recipe updated");

  return null;
}

export default function EditRecipe() {
  const recipeId = useParams().recipeId;
  const [authorization, setAuthorization] = useOutletContext();
  const [recipeDetails, setRecipeDetails] = useState({});

  useEffect(() => {
    const getRecipeDetails = async () => {
      const res = await fetch(
        `http://localhost:3000/get-recipe-details/${recipeId}`
      );
      const recipeDetails = await res.json();

      setRecipeDetails(recipeDetails);
    };

    getRecipeDetails();
  }, [recipeId]);

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
