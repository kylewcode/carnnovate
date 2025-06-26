import { Link } from "react-router-dom";

import dummyThumbnail from "@/img/recipe-icon-75x75.png";

function Summary({ recipe }) {
  return (
    <li className="card">
      <div className="thumbnail">
        <img
          src={recipe.thumbnail ? recipe.thumbnail : dummyThumbnail}
          width={recipe.thumbnail ? "200px" : "75px"}
          alt="Recipe thumbnail"
        />
      </div>
      <Link to={`detail/${recipe.recipe_id}`}>
        <h2>{recipe.title}</h2>
      </Link>
      <p>Time: {recipe.time}</p>
      <p>Votes: {recipe.votes}</p>
    </li>
  );
}

export default Summary;
