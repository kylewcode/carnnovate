import { useState } from "react";

import { sortByTitle } from "../utils/sorts";
import { sortByTime } from "../utils/sorts";
import { sortByVotes } from "../utils/sorts";
import { sortDefault } from "../utils/sorts";

import Summary from "..//components/Summary";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sortState, setSortState] = useState("sort-none");
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

  if (searchResults.length > 0) {
    let sortedSearchResults = [];

    if (sortState === "sort-title") {
      sortedSearchResults = sortByTitle(searchResults);
    } else if (sortState === "sort-time") {
      sortedSearchResults = sortByTime(searchResults);
    } else if (sortState === "sort-votes") {
      sortedSearchResults = sortByVotes(searchResults);
    } else if (sortState === "sort-none") {
      sortedSearchResults = sortDefault(searchResults);
    }

    sessionStorage.setItem("search", JSON.stringify(sortedSearchResults));

    for (const result of sortedSearchResults) {
      recipesToDisplay.push(<Summary key={result.recipe_id} recipe={result} />);
    }
  }

  if (searchResults.length === 0 && sessionStorage.getItem("search")) {
    let sortedSearchResults = [];
    let storedSearch = JSON.parse(sessionStorage.getItem("search"));

    if (sortState === "sort-title") {
      sortedSearchResults = sortByTitle(storedSearch);
    } else if (sortState === "sort-time") {
      sortedSearchResults = sortByTime(storedSearch);
    } else if (sortState === "sort-votes") {
      sortedSearchResults = sortByVotes(storedSearch);
    } else if (sortState === "sort-none") {
      sortedSearchResults = sortDefault(storedSearch);
    }

    sessionStorage.setItem("search", JSON.stringify(sortedSearchResults));

    for (const recipe of sortedSearchResults) {
      recipesToDisplay.push(<Summary key={recipe.recipe_id} recipe={recipe} />);
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
