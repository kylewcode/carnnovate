import { useState } from "react";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sortState, setSortState] = useState("sort-none");
  const recipesToDisplay = [];

  const handleSearch = async () => {
    // 1. Retrieve search results.
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

  const sortByTitle = () => {
    const sortedResultsByTitle = [...searchResults].sort((next, current) => {
      if (next.title < current.title) {
        return -1;
      }

      if (next.title > current.title) {
        return 1;
      }

      return 0;
    });

    return sortedResultsByTitle;
  };

  const sortByTime = () => {
    const sortedResultsByTime = [...searchResults].sort((next, current) => {
      if (next.time < current.time) {
        return -1;
      }

      if (next.time > current.time) {
        return 1;
      }

      return 0;
    });

    return sortedResultsByTime;
  };

  const sortByVotes = () => {
    const sortedResultsByVotes = [...searchResults].sort((next, current) => {
      if (next.votes > current.votes) {
        return -1;
      }

      if (next.votes < current.votes) {
        return 1;
      }

      return 0;
    });

    return sortedResultsByVotes;
  };

  const sortDefault = () => {
    return [...searchResults];
  };

  // (This code will sort as expected. 50%)(True 100%)
  // const handleDropdown = (e) => {
  //   const option = e.target.value;

  //   if (option === "sort-title") {
  //     sortByTitle();
  //   }
  //   if (option === "sort-time") {
  //     sortByTime();
  //   }
  //   if (option === "sort-votes") {
  //     sortByVotes();
  //   }

  //   if (option === "sort-none") {
  //     sortDefault();
  //   }
  // };

  const handleDropdown = (e) => {
    const option = e.target.value;

    if (option === "sort-title") {
      setSortState("sort-title");
    } else if (option === "sort-time") {
      setSortState("sort-time");
    } else if (option === "sort-votes") {
      setSortState("sort-votes");
    } else {
      setSortState("sort-none");
    }
  };

  // Triggers infinite renders.
  // if (sortState === "sort-title") {
  //   sortByTitle();
  // } else if (sortState === "sort-time") {
  //   sortByTime();
  // } else if (sortState === "sort-votes") {
  //   sortByVotes();
  // } else {
  //   sortDefault();
  // }

  if (searchResults.length !== 0) {
    // 2. Find out what sort method is selected.
    let sortedSearchResults = [];
    if (sortState === "sort-title") {
      sortedSearchResults = sortByTitle();
    } else if (sortState === "sort-time") {
      sortedSearchResults = sortByTime();
    } else if (sortState === "sort-votes") {
      sortedSearchResults = sortByVotes();
    } else if (sortState === "sort-none") {
      sortedSearchResults = sortDefault();
    }
    // Return sorted results.
    for (const {
      recipe_id,
      title,
      ingredients,
      description,
      time,
      instructions,
      votes,
    } of sortedSearchResults) {
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
