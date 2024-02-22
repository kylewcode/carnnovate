import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { getAuth, getUser } from "../utils/ajax";

export default function Profile() {
  const userInit = {
    username: "",
    recipes: [],
    favorites: [],
    authorization: "authorizing",
  };

  const [user, setUser] = useState(userInit);

  useEffect(() => {
    getAuth()
      .then((isAuthorized) => {
        if (isAuthorized) {
          return getUser();
        }

        setUser((prevUser) => ({ ...prevUser, authorization: "unauthorized" }));
      })
      .then((user) => {
        if (user) {
          // Server is currently not returning user favorites.
          setUser((prevUser) => ({
            ...prevUser,
            username: user.username,
            recipes: user.recipes,
            authorization: "authorized",
          }));
        }
      });
  }, []);

  if (user.authorization === "authorized") {
    if (user.username) {
      return (
        <div>
          <h2>{user.username}</h2>
          <p>Profile image goes here</p>
          <p>Recipes go here</p>
          <ul>
            {user.recipes.length !== 0 ? (
              user.recipes.map((recipe, index) => {
                return (
                  <li key={index}>
                    <Link to={`edit-recipe/${recipe.recipe_id}`}>
                      {recipe.title}
                    </Link>
                  </li>
                );
              })
            ) : (
              <p>No recipes created yet! Create a recipe here *provide link</p>
            )}
          </ul>
          <p>Favorites go here</p>
        </div>
      );
    } else {
      return <div>Loading user data...</div>;
    }
  }

  if (user.authorization === "unauthorized") {
    return (
      <div>
        <Navigate to="/login" replace />;
      </div>
    );
  }

  if (user.authorization === "authorizing") {
    return <div>Authorizing...</div>;
  }
}
