import { useState } from "react";

import { sortByTitle } from "../utils/sorts";
import { sortByTime } from "../utils/sorts";
import { sortByVotes } from "../utils/sorts";
import { sortDefault } from "../utils/sorts";

import Summary from "..//components/Summary";

export default function Search() {
  const initSearchtext = sessionStorage.getItem("searchText") || "";
  const initSortState = sessionStorage.getItem("sortState") || "sort-none";
  const initSearchState = JSON.parse(sessionStorage.getItem("search")) || [];
  const [searchText, setSearchText] = useState(initSearchtext);
  const [sortState, setSortState] = useState(initSortState);
  const [searchResults, setSearchResults] = useState(initSearchState);
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
    sessionStorage.setItem("sortState", option);

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

  return (
    <div>
      <input
        type="text"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          sessionStorage.setItem("searchText", e.target.value);
        }}
        onKeyUp={handleKeyUp}
        placeholder="Enter your search text"
      />
      <button onClick={handleSearch}>Search</button>
      <label htmlFor="sort-id">Sort by:</label>
      <select
        id="sort-id"
        name="sort-dropdown"
        onChange={handleDropdown}
        defaultValue={sortState}
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
