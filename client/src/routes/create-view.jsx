import { Form } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

let userAccessToken = null;

export async function action({ request }) {
  const formData = await request.formData();

  await fetch("http://localhost:3000/create", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  });

  return null;
}

export default function Create() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getAccessToken = async () => {
      const domain = "dev-vzyetmmalo5qhq3t.us.auth0.com";

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://${domain}/api/v2/`,
            scope: "read:current_user",
          },
        });

        // console.log(accessToken);
        userAccessToken = accessToken;
        // console.log(userAccessToken);
      } catch (error) {
        console.log(error.message);
      }
    };

    getAccessToken();
  }, [getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <Form method="post" encType="multipart/form-data">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue="Bacon-wrapped Shrimp"
        />

        <label htmlFor="image">Upload image</label>
        <input type="file" name="image" id="image" />

        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          cols="30"
          rows="10"
          placeholder="Enter a description..."
          defaultValue="This is a description."
        ></textarea>

        <label htmlFor="ingredients">Ingredients</label>
        <textarea
          name="ingredients"
          id="ingredients"
          cols="30"
          rows="10"
          placeholder="Enter ingredients with a new line for each ingredient."
          defaultValue="These are ingredients."
        ></textarea>

        <label htmlFor="instructions">Instructions</label>
        <textarea
          name="instructions"
          id="instructions"
          cols="30"
          rows="10"
          placeholder="Enter instructions..."
          defaultValue="These are instructions."
        ></textarea>

        <label htmlFor="time">Time (in minutes)</label>
        <input type="number" name="time" id="time" defaultValue="30" />

        <button type="submit">Submit</button>
      </Form>
    )
  );
}
