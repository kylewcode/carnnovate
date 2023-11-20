import { useState } from "react";

import { sortByTitle } from "../utils/sorts";
import { sortByTime } from "../utils/sorts";
import { sortByVotes } from "../utils/sorts";
import { sortDefault } from "../utils/sorts";

import Summary from "./Summary";

function Search() {
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

    if (searchResults.length !== 0) {
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
                <Summary recipe_id={recipe_id} title={title} time={time} votes={votes} />
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

export default Search;