function RecipeDetails({ recipe }) {
  return (
    <div className="recipe-details-layout">
      <h1>{recipe.details.title}</h1>
      <img
        src={recipe.details.image}
        alt={`Image of ${recipe.details.title}`}
      />
      <div className="separator"></div>
      <h2>Description</h2>
      <p>{recipe.details.description}</p>
      <div className="separator"></div>
      <h2>Ingredients</h2>
      <p>{recipe.details.ingredients}</p>
      <div className="separator"></div>
      <h2>Instructions</h2>
      <p>{recipe.details.instructions}</p>
      <h2>Time - {recipe.details.time}</h2>
      <h2>Votes - {recipe.details.votes}</h2>
      <h2>Favorites - {recipe.favorites}</h2>
    </div>
  );
}

export default RecipeDetails;
