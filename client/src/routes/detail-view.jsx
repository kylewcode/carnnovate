import { useEffect, useState } from "react";
import {
  Form,
  useParams,
  useOutletContext,
  useLoaderData,
  useActionData,
} from "react-router-dom";
import { getComments, getFavorites, getRecipe, getVotes } from "../utils/ajax";

import RecipeDetails from "../components/RecipeDetails";
import RecipeComments from "../components/RecipeComments";

import "../styles/detail-view.css";

export async function action({ params, request }) {
  const formData = await request.formData();
  const commentText = formData.get("comment");

  await fetch(`http://localhost:3000/add-comment/${params.recipeId}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const res = await fetch("http://localhost:3000/get-username", {
    credentials: "include",
  });
  const data = await res.json();

  window.alert("Comment submitted.");

  return { text: commentText, user_name: data.user_name };
}

export async function loader({ params }) {
  const details = await getRecipe(params.recipeId);
  const comments = await getComments(params.recipeId);
  const favorites = await getFavorites(params.recipeId);
  const votes = await getVotes(params.recipeId);

  return {
    comments: comments,
    details: details,
    favorites: favorites,
    votes: votes,
  };
}

export default function Detail() {
  const { comments, details, favorites, votes } = useLoaderData();
  const newComment = useActionData();
  const [authorization, setAuthorization] = useOutletContext();
  const initRecipe = {
    id: useParams().recipeId,
    details: details,
    comments: comments,
    favorites: favorites.favoriteCount,
    voted: votes.voted,
    favorited: favorites.favorited,
  };
  const [recipe, setRecipe] = useState(initRecipe);

  useEffect(() => {
    if (newComment) {
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        comments: [...prevRecipe.comments, newComment],
      }));
    }
  }, [newComment]);

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
          <RecipeDetails recipe={recipe} />
          <div>
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
          <RecipeComments recipe={recipe} />
        </>
      );
    } else {
      return <div>Loading recipe...</div>;
    }
  }

  if (authorization === "unauthorized") {
    if (recipe.details.title) {
      return (
        <div className="detailpage-layout">
          <RecipeDetails recipe={recipe} />
          <RecipeComments recipe={recipe} />
        </div>
      );
    } else {
      return <div>Recipe loading...</div>;
    }
  }

  if (authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
