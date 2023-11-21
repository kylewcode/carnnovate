import { useLocation } from "react-router-dom";

export default function Detail() {
    const { state: recipe } = useLocation();

    return (
        <div>
            <h2>{recipe.title}</h2>
            <img src={recipe.image} alt="" />
            <p>Description: {recipe.description}</p>
            <p>Ingredients {recipe.ingredients}</p>
            <p>Instructions: {recipe.instructions}</p>
            <p>Time: {recipe.time}</p>
            <p>Votes: {recipe.votes}</p>
        </div>
    )
}