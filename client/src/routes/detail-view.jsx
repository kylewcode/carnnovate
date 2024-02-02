import { useEffect, useState } from "react";
import { Form, useLocation, useParams } from "react-router-dom";

import { getAuth, getComments, getFavorites } from "../utils/ajax";

export async function action({ params, request }) {
  const formData = await request.formData();

  await fetch(`http://localhost:3000/add-comment/${params.recipeId}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return null;
}

export default function Detail() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [recipeComments, setRecipeComments] = useState([]);
  const [recipeFavorites, setRecipeFavorites] = useState([]);
  const [userHasFavorited, setUserHasFavorited] = useState(false);

  const { state: recipe } = useLocation();
  const recipeId = useParams().recipeId;

  useEffect(() => {
    getAuth().then((isAuthorized) => setIsAuthorized(isAuthorized));
  }, []);

  useEffect(() => {
    getComments(recipeId).then((comments) => setRecipeComments(comments));
  }, [recipeId]);

  useEffect(() => {
    getFavorites(recipeId).then((data) => {
      setRecipeFavorites(data.favorites);
      setUserHasFavorited(data.favorited);
    });
  }, [recipeId]);

  const favoriteRecipe = async () => {
    const res = await fetch(
      `http://localhost:3000/favorite-recipe/${recipeId}`,
      {
        credentials: "include",
      }
    );

    if (res.ok) {
      getFavorites(recipeId).then((data) => setRecipeFavorites(data.favorites));
      setUserHasFavorited(true);
    }
  };

  const unfavoriteRecipe = async () => {
    const res = await fetch(
      `http://localhost:3000/unfavorite-recipe/${recipeId}`,
      {
        credentials: "include",
      }
    );

    if (res.ok) {
      getFavorites(recipeId).then((data) => setRecipeFavorites(data.favorites));
      setUserHasFavorited(false);
    }
  };

  if (isAuthorized && recipe) {
    return (
      <>
        <div>
          <h2>{recipe.title}</h2>
          <img src={recipe.image} alt="" />
          <p>Description: {recipe.description}</p>
          <p>Ingredients {recipe.ingredients}</p>
          <p>Instructions: {recipe.instructions}</p>
          <p>Time: {recipe.time}</p>
          <p>Votes: {recipe.votes}</p>
          <p>
            {!userHasFavorited ? (
              <span>
                <button type="button" onClick={() => favoriteRecipe()}>
                  Favorite this!
                </button>
              </span>
            ) : (
              <span>
                <button type="button" onClick={() => unfavoriteRecipe()}>
                  Unfavorite this!
                </button>
              </span>
            )}
            Favorites: {recipeFavorites.length}
          </p>
        </div>
        <h2>Comments</h2>
        <Form method="post" encType="multipart/form-data">
          <label htmlFor="comment">New Comment</label>
          <textarea
            name="comment"
            id="comment"
            cols="30"
            rows="10"
            placeholder="Enter comment..."
          ></textarea>
          <button type="submit">Submit</button>
        </Form>
        {recipeComments.length !== 0
          ? recipeComments.map((comment, index) => (
              <div key={index}>
                <h3>{comment.user_name}</h3>
                <p>{comment.text}</p>
              </div>
            ))
          : null}
      </>
    );
  } else if (recipe) {
    return (
      <>
        <div>
          <h2>{recipe.title}</h2>
          <img src={recipe.image} alt="" />
          <p>Description: {recipe.description}</p>
          <p>Ingredients {recipe.ingredients}</p>
          <p>Instructions: {recipe.instructions}</p>
          <p>Time: {recipe.time}</p>
          <p>Votes: {recipe.votes}</p>
          <p>Favorites: {recipeFavorites.length}</p>
        </div>
        <h2>Comments</h2>
        {recipeComments.length !== 0
          ? recipeComments.map((comment, index) => (
              <div key={index}>
                <h3>{comment.user_name}</h3>
                <p>{comment.text}</p>
              </div>
            ))
          : null}
      </>
    );
  }

  return <div>Loading...</div>;
}
