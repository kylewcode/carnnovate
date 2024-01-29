import { useEffect, useState } from "react";
import { Form, useLocation, useParams } from "react-router-dom";

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
  const { state: recipe } = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [recipeComments, setRecipeComments] = useState([]);
  const recipeId = useParams().recipeId;

  useEffect(() => {
    const getAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth", {
          credentials: "include",
        });
        const auth = await res.json();

        setIsAuthorized(auth.isAuthorized);
      } catch (error) {
        console.error(error);
      }
    };

    getAuth();
  }, []);

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/get-comments/${recipeId}`,
          { credentials: "include" }
        );
        const comments = await res.json();

        setRecipeComments(comments);
      } catch (error) {
        console.error(error);
      }
    };

    getComments();
  }, [recipeId]);

  //   if user is authorized, show comment form and detail
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
    // else show only detail
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
        </div>
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
