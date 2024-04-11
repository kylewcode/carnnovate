const isProduction = import.meta.env.PROD;

export const apiConfig = {
  endpoint: isProduction
    ? "https://carnnovate.herokuapp.com"
    : "http://localhost:3000",
};
