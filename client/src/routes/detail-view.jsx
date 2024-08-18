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

import { apiConfig } from "../../config";

export async function action({ params, request }) {
  const formData = await request.formData();
  const commentText = formData.get("comment");

  await fetch(`${apiConfig.endpoint}/add-comment/${params.recipeId}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const res = await fetch(`${apiConfig.endpoint}/get-username`, {
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
      `${apiConfig.endpoint}/favorite-recipe/${recipe.id}`,
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
      `${apiConfig.endpoint}/unfavorite-recipe/${recipe.id}`,
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
    const res = await fetch(`${apiConfig.endpoint}/vote/${recipe.id}`, {
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
    const res = await fetch(`${apiConfig.endpoint}/unvote/${recipe.id}`, {
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
        <div className="detailpage-layout">
          <RecipeDetails recipe={recipe} />
          <div className="detail-buttons-wrapper">
            {!recipe.voted ? (
              <span>
                <button
                  type="button"
                  onClick={() => voteForRecipe()}
                  className="content-button"
                >
                  Vote for recipe
                </button>
              </span>
            ) : (
              <span>
                <button
                  type="button"
                  onClick={() => unvoteRecipe()}
                  className="content-button"
                >
                  Unvote recipe
                </button>
              </span>
            )}
            {!recipe.favorited ? (
              <span>
                <button
                  type="button"
                  onClick={() => favoriteRecipe()}
                  className="content-button"
                >
                  Favorite this
                </button>
              </span>
            ) : (
              <span>
                <button
                  type="button"
                  onClick={() => unfavoriteRecipe()}
                  className="content-button"
                >
                  Unfavorite this
                </button>
              </span>
            )}
          </div>
          <RecipeComments recipe={recipe} />
          <Form method="post" encType="multipart/form-data">
            <label htmlFor="comment">New Comment</label>
            <textarea
              name="comment"
              id="comment"
              cols="30"
              rows="10"
              placeholder="Enter comment..."
            ></textarea>
            <button type="submit" className="content-button">
              Submit
            </button>
          </Form>
        </div>
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
