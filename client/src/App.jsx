import { useState } from "react";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/recipes?search=${encodeURIComponent(searchText)}`
      );
      const recipes = await response.json();
      setSearchResults(recipes);
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const sortedRecipesToDisplay = [];

  for (const {
    recipe_id,
    title,
    ingredients,
    description,
    time,
    instructions,
    votes,
  } of searchResults) {
    sortedRecipesToDisplay.push(
      <li key={recipe_id}>
        <h2>Title: {title}</h2>
        <p>Ingredients: {ingredients}</p>
        <p>Description: {description}</p>
        <p>Time: {time}</p>
        <p>Instructions: {instructions}</p>
        <p>Votes: {votes}</p>
      </li>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder="Enter your search text"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>{sortedRecipesToDisplay}</ul>
    </div>
  );
}

export default App;
