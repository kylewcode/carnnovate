import { useState } from "react";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const recipesToDisplay = [];

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

  const sortDefault = () => {};
  const sortByTitle = () => {
    // Sort search results
    const sortedResultsByTitle = [...searchResults].sort((next, current) => {
      if (next.title < current.title) {
        return -1;
      }

      if (next.title > current.title) {
        return 1;
      }

      return 0;
    });
    console.log(sortedResultsByTitle);
    // update state
    setSearchResults(sortedResultsByTitle);
  };
  const sortByTime = () => {};
  const sortByVotes = () => {};

  const handleDropdown = (e) => {
    console.log("handleDropdown", e.target.value);
    const option = e.target.value;

    if (option === "sort-title") {
      sortByTitle();
    }
    if (option === "sort-time") {
      sortByTime();
    }
    if (option === "sort-votes") {
      sortByVotes();
    }

    if (option === "sort-none") {
      sortDefault();
    }
  };

  if (searchResults.length !== 0) {
    for (const {
      recipe_id,
      title,
      ingredients,
      description,
      time,
      instructions,
      votes,
    } of searchResults) {
      recipesToDisplay.push(
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
      <label htmlFor="sort-id">Sort by:</label>
      <select
        id="sort-id"
        name="sort-dropdown"
        onChange={handleDropdown}
        defaultValue="sort-none"
      >
        <option value="sort-none">None</option>
        <option value="sort-title">Title</option>
        <option value="sort-time">Total Time</option>
        <option value="sort-votes">Votes</option>
      </select>
      <ul>{recipesToDisplay}</ul>
    </div>
  );
}

export default App;
