import { useEffect, useState } from "react";
import { Link, Navigate, useOutletContext } from "react-router-dom";

import { getUser } from "../utils/ajax";

export default function Profile() {
  const userInit = {
    username: "",
    recipes: [],
    favorites: [],
  };

  const [user, setUser] = useState(userInit);
  const [authorization, setAuthorization] = useOutletContext();

  useEffect(() => {
    if (authorization === "authorized") {
      getUser().then((user) => {
        // Server is currently not returning user favorites.
        setUser((prevUser) => ({
          ...prevUser,
          username: user.username,
          recipes: user.recipes,
        }));
      });
    }
  }, [authorization]);

  if (authorization === "authorized") {
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
