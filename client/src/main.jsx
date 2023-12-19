import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Search from "./routes/search-view";
import Detail from "./routes/detail-view";
<<<<<<< HEAD
import Create, { action as createAction } from "./routes/create-view";
import Profile from "./routes/profile-view";
import ErrorPage from "./error-page";
=======
import ErrorPage from './error-page';
>>>>>>> parent of b37ad81 (Req fulfilled: it must have a recipe creation view)

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
<<<<<<< HEAD
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
=======
    ]
  }
>>>>>>> parent of b37ad81 (Req fulfilled: it must have a recipe creation view)
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-vzyetmmalo5qhq3t.us.auth0.com"
      clientId="JQg8lpJ56rVQGFpJWvWo7MwujdSpzweb"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  </React.StrictMode>
);
