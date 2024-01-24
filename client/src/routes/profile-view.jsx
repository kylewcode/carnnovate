import { useEffect, useState } from "react";

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

  if (user) {
    return (
      <div>
        <h2>{user.username}</h2>
        <p>Profile image goes here</p>
        <p>Recipes go here</p>
        <ul>
          {user.recipes.map((recipe, index) => {
            return <li key={index}>{recipe.title}</li>;
          })}
        </ul>
        <p>Favorites go here</p>
      </div>
    );
  }

  return <div>Loading...</div>;
}
