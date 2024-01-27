import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    // Get user data
    const getUser = async () => {
      const res = await fetch("http://localhost:3000/get-user", {
        credentials: "include",
      });
      const user = await res.json();

      setUser(user);
    };

    getUser();
  }, []);

  if (user.username) {
    return (
      <div>
        <h2>{user.username}</h2>
        <p>Profile image goes here</p>
        <p>Recipes go here</p>
        <ul>
          {user.recipes.map((recipe, index) => {
            return (
              <li key={index}>
                <Link to={`edit-recipe/${recipe.recipe_id}`}>
                  {recipe.title}
                </Link>
              </li>
            );
          })}
        </ul>
        <p>Favorites go here</p>
      </div>
    );
  }

  return <div>Loading...</div>;
}
