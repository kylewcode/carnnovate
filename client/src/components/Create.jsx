function Create({ userIsCreating }) {
  const handleClick = () => {
    userIsCreating(false);
  };
  return (
    <>
      <h2>Enter the details for a new recipe.</h2>
      <button onClick={handleClick}>Submit Recipe</button>
    </>
  );
}

export default Create;
