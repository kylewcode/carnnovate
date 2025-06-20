const { VITE_PROD_API, VITE_DEV_API } = import.meta.env;

export const apiConfig = {
  endpoint: VITE_PROD_API ? VITE_PROD_API : VITE_DEV_API,
};
