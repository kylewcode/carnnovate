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

    return favorites;
  } catch (error) {
    console.error(error);
  }
};
