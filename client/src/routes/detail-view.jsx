import { useEffect, useState } from "react";
import { Form, useParams, useOutletContext } from "react-router-dom";
import { getComments, getFavorites, getRecipe, getVotes } from "../utils/ajax";

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
  const initRecipe = {
    id: useParams().recipeId,
    details: {},
    comments: [],
    favorites: 0,
    voted: false,
    favorited: false,
  };
  const [authorization, setAuthorization] = useOutletContext();
  const [recipe, setRecipe] = useState(initRecipe);

  useEffect(() => {
    getRecipe(recipe.id).then((recipe) => {
      setRecipe((prev) => ({ ...prev, details: recipe }));
    });
  }, [recipe.id]);

  useEffect(() => {
    getComments(recipe.id).then((comments) =>
      setRecipe((prev) => ({ ...prev, comments: comments }))
    );
  }, [recipe.id]);

  useEffect(() => {
    getFavorites(recipe.id).then((favorites) => {
      setRecipe((prev) => ({
        ...prev,
        favorites: favorites.favoriteCount,
        favorited: favorites.favorited,
      }));
    });
  }, [recipe.id]);

  useEffect(() => {
    getVotes(recipe.id).then((votes) => {
      setRecipe((prev) => ({
        ...prev,
        details: { ...prev.details, votes: votes.voteCount },
        voted: votes.voted,
      }));
    });
  }, [recipe.id]);

  // Refactor to return number
  const favoriteRecipe = async () => {
    const res = await fetch(
      `http://localhost:3000/favorite-recipe/${recipe.id}`,
      {
        credentials: "include",
      }
    );

    if (res.ok) {
      setRecipe((prev) => ({
        ...prev,
        favorites: prev.favorites++,
        favorited: true,
      }));
    }
  };

  const unfavoriteRecipe = async () => {
    const res = await fetch(
      `http://localhost:3000/unfavorite-recipe/${recipe.id}`,
      {
        credentials: "include",
      }
    );

    if (res.ok) {
      setRecipe((prev) => ({
        ...prev,
        favorites: prev.favorites--,
        favorited: false,
      }));
    }
  };

  const voteForRecipe = async () => {
    const res = await fetch(`http://localhost:3000/vote/${recipe.id}`, {
      credentials: "include",
    });

    if (res.ok) {
      setRecipe((prev) => ({
        ...prev,
        details: { ...prev.details, votes: prev.details.votes++ },
        voted: true,
      }));
    }
  };

  const unvoteRecipe = async () => {
    const res = await fetch(`http://localhost:3000/unvote/${recipe.id}`, {
      credentials: "include",
    });

    if (res.ok) {
      setRecipe((prev) => ({
        ...prev,
        details: { ...prev.details, votes: prev.details.votes-- },
        voted: false,
      }));
    }
  };

  if (authorization === "authorized") {
    if (recipe.details.title) {
      return (
        <>
          <div>
            <h2>{recipe.details.title}</h2>
            <img src={recipe.details.image} alt="" />
            <p>Description: {recipe.details.description}</p>
            <p>Ingredients {recipe.details.ingredients}</p>
            <p>Instructions: {recipe.details.instructions}</p>
            <p>Time: {recipe.details.time}</p>
            <p>
              {!recipe.voted ? (
                <span>
                  <button type="button" onClick={() => voteForRecipe()}>
                    Vote for recipe
                  </button>
                </span>
              ) : (
                <span>
                  <button type="button" onClick={() => unvoteRecipe()}>
                    Unvote recipe
                  </button>
                </span>
              )}
              Votes: {recipe.details.votes}
            </p>
            <p>
              {!recipe.favorited ? (
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
              Favorites: {recipe.favorites}
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
          {recipe.comments.length !== 0
            ? recipe.comments.map((comment, index) => (
                <div key={index}>
                  <h3>{comment.user_name}</h3>
                  <p>{comment.text}</p>
                </div>
              ))
            : null}
        </>
      );
    } else {
      return <div>Loading recipe...</div>;
    }
  }

  if (authorization === "unauthorized") {
    if (recipe.details.title) {
      return (
        <>
          <div>
            <h2>{recipe.details.title}</h2>
            <img src={recipe.details.image} alt="" />
            <p>Description: {recipe.details.description}</p>
            <p>Ingredients {recipe.details.ingredients}</p>
            <p>Instructions: {recipe.details.instructions}</p>
            <p>Time: {recipe.details.time}</p>
            <p>Votes: {recipe.details.votes}</p>
            <p>Favorites: {recipe.favorites}</p>
          </div>
          <h2>Comments</h2>
          {recipe.comments.length !== 0
            ? recipe.comments.map((comment, index) => (
                <div key={index}>
                  <h3>{comment.user_name}</h3>
                  <p>{comment.text}</p>
                </div>
              ))
            : null}
        </>
      );
    } else {
      return <div>Recipe loading...</div>;
    }
  }

  if (authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
