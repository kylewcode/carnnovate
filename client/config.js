const isProduction = import.meta.env.PROD;
console.log("Environment is production: ", isProduction);

export const apiConfig = {
  endpoint: isProduction
    ? "https://carnnovate-4fb4882151ae.herokuapp.com/api"
    : "http://localhost:3001/api",
};
