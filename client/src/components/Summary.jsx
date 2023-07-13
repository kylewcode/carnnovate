function Summary({
  recipe_id,
  title,
  ingredients,
  description,
  time,
  instructions,
  votes,
  examineRecipe,
}) {
  const handleClick = () => {
    examineRecipe({
      title,
      ingredients,
      description,
      time,
      instructions,
      votes,
    });
  };
  return (
    <>
      <li key={recipe_id}>
        <h2>Title: {title}</h2>
        <p>Ingredients: {ingredients}</p>
        <p>Description: {description}</p>
        <p>Time: {time}</p>
        <p>Instructions: {instructions}</p>
        <p>Votes: {votes}</p>
        <button type="button" onClick={handleClick}>
          View recipe
        </button>
      </li>
    </>
  );
}

export default Summary;
