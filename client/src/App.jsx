import { useState } from "react";

import Search from "./components/Search";
import Detail from "./components/Detail";
import Create from "./components/Create";
import "./App.css";

function App() {
  const [userIsCreating, setUserIsCreating] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState(null);
  // if user is creating a recipe...
  // if (userIsCreating) {
  //   return (
  //     <>
  //       <h1>Carnnovate</h1>
  //       <p>A user created recipe database for the carnivore diet</p>
  //       <Create />
  //       <Search examineRecipe={setRecipeDetails} />
  //     </>
  //   );
  // }
  // // If user is reading details of a recipe...
  // if (recipeDetails) {
  //   return (
  //     <>
  //       <h1>Carnnovate</h1>
  //       <p>A user created recipe database for the carnivore diet</p>
  //       <Detail recipeDetails={recipeDetails} exitView={setRecipeDetails} />
  //       <Search examineRecipe={setRecipeDetails} />
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     <h1>Carnnovate</h1>
  //     <p>A user created recipe database for the carnivore diet</p>
  //     <Search examineRecipe={setRecipeDetails} />
  //   </>
  // );

  return (
    <>
      <h1>Carnnovate</h1>
      <p>A user created recipe database for the carnivore diet</p>
      {recipeDetails ? (
        <Detail recipeDetails={recipeDetails} exitView={setRecipeDetails} />
      ) : null}
      {userIsCreating ? <Create /> : null}
      <Search examineRecipe={setRecipeDetails} />
    </>
  );
}

export default App;
