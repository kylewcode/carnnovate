import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

import { getAuth } from "../utils/ajax";

export default function Root() {
  const [authorization, setAuthorization] = useState("authorizing");

  useEffect(() => {
    getAuth().then((isAuthorized) =>
      isAuthorized
        ? setAuthorization("authorized")
        : setAuthorization("unauthorized")
    );
  }, []);

  const handleClick = () => {
    setAuthorization("unauthorized");
    fetch("http://localhost:3000/logout", { credentials: "include" })
      .then((response) => response.json())
      .then((json) => console.log(json.message));
  };

  return (
    <>
      <header>
        <img src="../src/img/logo-150w.jpg" alt="Carnnovate logo" />
        <nav>
          <h1>Carnnovate</h1>
          <ul>
            <li>
              <Link to={`/`}>Home</Link>
            </li>
            <li>
              <Link to={`search`}>Search</Link>
            </li>
            {authorization === "authorized" ? (
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
            {authorization === "authorizing" ||
            authorization === "unauthorized" ? (
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
      </header>

      <main>
        <Outlet context={[authorization, setAuthorization]} />
      </main>
      <footer>This is the footer.</footer>
    </>
  );
}
