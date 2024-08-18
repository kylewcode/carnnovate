function RecipeComments({ recipe }) {
  return (
    <div className="recipe-comments-layout">
      <h2>Comments</h2>
      {recipe.comments.length !== 0
        ? recipe.comments.map((comment, index) => (
            <div key={index}>
              <h3>{comment.user_name}</h3>
              <p>{comment.text}</p>
            </div>
          ))
        : null}
    </div>
  );
}

export default RecipeComments;
