import { useState } from "react";

import Search from "./components/Search";
import Detail from "./components/Detail";
import Create from "./components/Create";
import "./App.css";

// Purpose: Render components
function App() {
  const [userIsCreating, setUserIsCreating] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState(null);

  const handleClick = () => {
    setUserIsCreating(true);
  };

  return (
    <>
      <h1>Carnnovate</h1>
      <p>A user created recipe database for the carnivore diet</p>
      <button onClick={handleClick}>Create a new recipe!</button>
      {recipeDetails ? (
        <Detail recipeDetails={recipeDetails} exitView={setRecipeDetails} />
      ) : null}
      {userIsCreating ? <Create userIsCreating={setUserIsCreating} /> : null}
      <Search examineRecipe={setRecipeDetails} />
    </>
  );
}

export default App;
