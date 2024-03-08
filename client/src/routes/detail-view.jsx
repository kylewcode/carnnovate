import { useEffect, useState } from "react";
import { Form, useParams, useOutletContext } from "react-router-dom";
import { getComments, getFavorites, getRecipe } from "../utils/ajax";

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
  const recipeId = useParams().recipeId;
  const [authorization, setAuthorization] = useOutletContext();
  const [recipeDetails, setRecipeDetails] = useState({});
  const [recipeComments, setRecipeComments] = useState([]);
  const [recipeFavorites, setRecipeFavorites] = useState([]);
  const [userHasFavorited, setUserHasFavorited] = useState(false);
  const [votes, setVotes] = useState(null);
  const [userHasVoted, setUserHasVoted] = useState(false);

  useEffect(() => {
    getRecipe(recipeId).then((recipe) => {
      setRecipeDetails(recipe);
    });
  }, [recipeId]);

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

  const voteForRecipe = async () => {
    const res = await fetch(`http://localhost:3000/vote/${recipeId}`, {
      credentials: "include",
    });
    const vote = await res.json();
    const voteCount = vote.voteCount;

    if (res.ok) {
      setVotes(voteCount);
      setUserHasVoted(true);
    }
  };

  const unvoteRecipe = async () => {
    const res = await fetch(`http://localhost:3000/unvote/${recipeId}`, {
      credentials: "include",
    });
    const vote = await res.json();
    const voteCount = vote.voteCount;

    if (res.ok) {
      setVotes(voteCount);
      setUserHasVoted(false);
    }
  };

  if (authorization === "authorized") {
    if (recipeDetails.title) {
      return (
        <>
          <div>
            <h2>{recipeDetails.title}</h2>
            <img src={recipeDetails.image} alt="" />
            <p>Description: {recipeDetails.description}</p>
            <p>Ingredients {recipeDetails.ingredients}</p>
            <p>Instructions: {recipeDetails.instructions}</p>
            <p>Time: {recipeDetails.time}</p>
            <p>
              {!userHasVoted ? (
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
              Votes: {votes}
            </p>
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
    } else {
      return <div>Loading recipe...</div>;
    }
  }

  if (authorization === "unauthorized") {
    if (recipeDetails.title) {
      return (
        <>
          <div>
            <h2>{recipeDetails.title}</h2>
            <img src={recipeDetails.image} alt="" />
            <p>Description: {recipeDetails.description}</p>
            <p>Ingredients {recipeDetails.ingredients}</p>
            <p>Instructions: {recipeDetails.instructions}</p>
            <p>Time: {recipeDetails.time}</p>
            <p>Votes: {votes}</p>
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
    } else {
      return <div>Recipe loading...</div>;
    }
  }

  if (authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
