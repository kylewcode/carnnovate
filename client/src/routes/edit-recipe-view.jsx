import { useState, useEffect } from "react";
import { Form, useParams, Navigate } from "react-router-dom";

import { getAuth } from "../utils/ajax";

export async function action({ params, request }) {
  const formData = await request.formData();

  await fetch(`http://localhost:3000/update-recipe/${params.recipeId}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return null;
}

export default function EditRecipe() {
  const [recipeDetails, setRecipeDetails] = useState({});
  const [authorization, setAuthorization] = useState("authorizing");
  const recipeId = useParams().recipeId;

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

  useEffect(() => {
    getAuth().then((isAuthorized) => {
      if (isAuthorized) {
        setAuthorization("authorized");
      } else {
        setAuthorization("unauthorized");
      }
    });
  }, []);

  if (authorization === "authorized") {
    if (!recipeDetails.title) {
      return <div>Loading...</div>;
    }

    return (
      <>
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

          <button type="submit">Update recipe</button>
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
