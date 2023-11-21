import { Link } from "react-router-dom";

function Summary({ recipe }) {
    return (
        <li>
            <Link to={`detail/${recipe.recipe_id}`} state={recipe}>
                <h2>{recipe.title}</h2>
            </Link>
            <p>Time: {recipe.time}</p>
            <p>Votes: {recipe.votes}</p>
        </li>
    )
}

export default Summary;