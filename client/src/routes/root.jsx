import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import { getAuth } from "../utils/ajax";

import "../App.css";
import "../styles/home-page.css";

export default function Root() {
  const [authorization, setAuthorization] = useState("authorizing");
  const location = useLocation();

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
        <img
          src="../src/img/logo-150w.jpg"
          alt="Carnnovate logo"
          className="logo"
        />
        <nav className="navigation">
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
                <li className="signup-button">
                  <Link to={`register`} className="white-text">
                    Sign Up
                  </Link>
                </li>
                <li className="login-button">
                  <Link to={`login`} className="white-text">
                    Login
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
      </header>

      <main className={location.pathname === "/" ? "homepage-layout" : null}>
        {location.pathname === "/" && (
          <div className="site-title">
            <h1>Carnnovate</h1>
            <h2>A user-driven recipe database for the Carnivore Diet</h2>
          </div>
        )}
        <Outlet context={[authorization, setAuthorization]} />
      </main>

      <footer>
        <div>
          <p>&copy; 2024 Carnnovate Inc.</p>
        </div>
      </footer>
    </>
  );
}
