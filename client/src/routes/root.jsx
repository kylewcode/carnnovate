import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import { getAuth } from "../utils/ajax";

import "../App.css";
import "../styles/home-page.css";

import logo from "@/img/logo-150w.jpg";

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
        <img src={logo} alt="Carnnovate logo" className="logo" />
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
                <li className="navigation-button">
                  <Link to={`create`}>Create</Link>
                </li>
                <li className="navigation-button">
                  <Link to={`profile`}>Profile</Link>
                </li>
                <li className="navigation-button">
                  <button type="button" onClick={() => handleClick()}>
                    Logout
                  </button>
                </li>
              </>
            ) : null}
            {authorization === "authorizing" ||
            authorization === "unauthorized" ? (
              <>
                <li className="navigation-button">
                  <Link to={`register`} className="white-text">
                    Sign Up
                  </Link>
                </li>
                <li className="navigation-button">
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
            <h2>
              Innovative Carnivores: A user-driven recipe database for the
              Carnivore Diet
            </h2>
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
