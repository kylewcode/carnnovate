import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* Future code to check for persistent login session after application mounts. */
  // useEffect(() => {
  //   async function authUser() {
  //     const response = await fetch("http://localhost:3000/auth");
  //     console.log(response);
  //     const auth = await response.json();
  //     console.log(auth);

  //     setIsLoggedIn(auth.isAuthorized);
  //   }

  //   authUser();
  // }, []);

  const handleClick = async () => {
    setIsLoggedIn(false);
    await fetch("http://localhost:3000/logout")
      .then((response) => response.json())
      .then((json) => console.log(json.message));
  };

  return (
    <>
      <nav>
        <h1>Carnnovate</h1>
        <ul>
          <li>
            <Link to={`/`}>Home</Link>
          </li>
          <li>
            <Link to={`search`}>Search</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <Link to={`create`}>Create New Recipe</Link>
              </li>
              <li>
                <Link to={`profile`}>Profile</Link>
              </li>
              <li>
                <button type="button" onClick={() => handleClick()}>
                  Logout
                </button>
              </li>
            </>
          ) : null}
          {!isLoggedIn ? (
            <>
              <li>
                <Link to={`register`}>Sign Up</Link>
              </li>
              <li>
                <Link to={`login`}>Login</Link>
              </li>
            </>
          ) : null}
        </ul>
      </nav>
      <div>
        <Outlet context={[isLoggedIn, setIsLoggedIn]} />
      </div>
    </>
  );
}
