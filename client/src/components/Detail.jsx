function Detail({ recipeDetails, exitView }) {
  const handleClick = () => {
    exitView(null);
  };

  return (
    <>
      <h2>Detail</h2>
      <h3>{recipeDetails.title}</h3>
      <p>{recipeDetails.ingredients}</p>
      <p>{recipeDetails.description}</p>
      <p>{recipeDetails.time}</p>
      <p>{recipeDetails.instructions}</p>
      <p>{recipeDetails.votes}</p>
      <button onClick={handleClick}>Close Detail View</button>
    </>
  );
}

export default Detail;
