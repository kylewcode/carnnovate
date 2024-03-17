export const getAuth = async () => {
  try {
    const res = await fetch("http://localhost:3000/auth", {
      credentials: "include",
    });
    const auth = await res.json();

    return auth.isAuthorized;
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async () => {
  const res = await fetch("http://localhost:3000/get-user", {
    credentials: "include",
  });
  const user = await res.json();

  return user;
};

export const getComments = async (recipeId) => {
  try {
    const res = await fetch(`http://localhost:3000/get-comments/${recipeId}`, {
      credentials: "include",
    });
    const comments = await res.json();

    return comments;
  } catch (error) {
    console.error(error);
  }
};

export const getFavorites = async (recipeId) => {
  try {
    const res = await fetch(`http://localhost:3000/get-favorites/${recipeId}`, {
      credentials: "include",
    });
    const favorites = await res.json();
    // (will be an object {favoriteCount: number, favorited: boolean} 99%)(True)
    console.log(favorites);

    return favorites;
  } catch (error) {
    console.error(error);
  }
};

export const getRecipe = async (recipeId) => {
  try {
    const res = await fetch(
      `http://localhost:3000/get-recipe-details/${recipeId}`,
      {
        credentials: "include",
      }
    );
    const recipe = await res.json();

    return recipe;
  } catch (error) {
    console.error(error);
  }
};

export const getVotes = async (recipeId) => {
  try {
    const res = await fetch(`http://localhost:3000/get-votes/${recipeId}`, {
      credentials: "include",
    });
    const votes = await res.json();

    return votes.voteCount;
  } catch (error) {
    console.error(error);
  }
};
