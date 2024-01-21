import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Search from "./routes/search-view";
import Detail from "./routes/detail-view";
import Create, { action as createAction } from "./routes/create-view";
import Register, { action as registerAction } from "./routes/register-view";
import Login, { action as loginAction } from "./routes/login-view";
import Profile from "./routes/profile-view";
import RequestReset, {
  action as requestResetAction,
} from "./routes/request-reset-view";
import PasswordReset, {
  action as passwordResetAction,
} from "./routes/password-reset";
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
        path: "register",
        element: <Register />,
        action: registerAction,
      },
      {
        path: "login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "login/request-password-reset",
        element: <RequestReset />,
        action: requestResetAction,
      },
      {
        path: "password-reset/:token",
        element: <PasswordReset />,
        action: passwordResetAction,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
