const isProduction = import.meta.env.PROD;
console.log("Environment is production: ", isProduction);

export const apiConfig = {
  endpoint: isProduction
    ? "https://carnnovate.herokuapp.com"
    : "http://localhost:3000",
};
// export const apiConfig = {
//   endpoint: "http://localhost:3000",
// };
