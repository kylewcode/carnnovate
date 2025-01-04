import React from "react";
import ReactDOM from "react-dom/client";

import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import Search from "./routes/search-view";
import Detail, {
  action as detailAction,
  loader as detailLoader,
} from "./routes/detail-view";
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
import EditRecipe, {
  action as editRecipeAction,
} from "./routes/edit-recipe-view";
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
        path: "search/detail/:recipeId",
        element: <Detail />,
        loader: detailLoader,
        action: detailAction,
      },
      {
        path: "create",
        element: <Create FilePond={FilePond} />,
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
      {
        path: "profile/edit-recipe/:recipeId",
        element: <EditRecipe FilePond={FilePond} />,
        action: editRecipeAction,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
