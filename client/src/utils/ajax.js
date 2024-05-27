import { apiConfig } from "../../config";

export const getAuth = async () => {
  try {
    const res = await fetch(`${apiConfig.endpoint}/auth`, {
      credentials: "include",
    });
    const auth = await res.json();

    return auth.isAuthorized;
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async () => {
  const res = await fetch(`${apiConfig.endpoint}/get-user`, {
    credentials: "include",
  });
  const user = await res.json();

  return user;
};

export const getComments = async (recipeId) => {
  try {
    const res = await fetch(`${apiConfig.endpoint}/get-comments/${recipeId}`, {
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
    const res = await fetch(`${apiConfig.endpoint}/get-favorites/${recipeId}`, {
      credentials: "include",
    });
    const favorites = await res.json();

    return favorites;
  } catch (error) {
    console.error(error);
  }
};

export const getRecipe = async (recipeId) => {
  try {
    const res = await fetch(
      `${apiConfig.endpoint}/get-recipe-details/${recipeId}`,
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
    const res = await fetch(`${apiConfig.endpoint}/get-votes/${recipeId}`, {
      credentials: "include",
    });
    const votes = await res.json();

    return votes;
  } catch (error) {
    console.error(error);
  }
};

export const deleteRecipe = async (recipeId) => {
  try {
    const res = await fetch(`${apiConfig.endpoint}/delete-recipe/${recipeId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const message = await res.json();

    return message;
  } catch (error) {
    console.error(error);
  }
};
