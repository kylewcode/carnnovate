import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api")
      .then((response) => response.json())
      .then(handleSuccess, handleError);
  }, []);

  function handleSuccess(recipes) {
    setRecipes(recipes);
  }

  function handleError(error) {
    console.log(error);
  }

  if (recipes) {
    const recipesToDisplay = [];

    for (const {
      recipe_id,
      title,
      ingredients,
      description,
      time,
      instructions,
    } of recipes) {
      recipesToDisplay.push(
        <div key={recipe_id}>
          <h2>Title: {title}</h2>
          <p>Ingredients: {ingredients}</p>
          <p>Description: {description}</p>
          <p>Time: {time}</p>
          <p>Instructions: {instructions}</p>
        </div>
      );
    }

    return <div>{recipesToDisplay}</div>;
  } else {
    return (
      <div className="App">
        <h2>Loading...</h2>
      </div>
    );
  }
}

export default App;
