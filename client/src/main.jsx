import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Search from "./routes/search-view";
import Detail from "./routes/detail-view";
import Create, { action as createAction } from "./routes/create-view";
import Profile from "./routes/profile-view";
import ErrorPage from "./error-page";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "search/detail/:recipe_id",
        element: <Detail />,
      },
      {
        path: "create",
        element: <Create />,
        action: createAction,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-vzyetmmalo5qhq3t.us.auth0.com"
      clientId="JQg8lpJ56rVQGFpJWvWo7MwujdSpzweb"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://dev-vzyetmmalo5qhq3t.us.auth0.com/api/v2/",
        // Will revisit scopes as it pertains to app security.
        // scope: "read:current_user update:current_user_metadata",
      }}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  </React.StrictMode>
);
