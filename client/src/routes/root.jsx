import { Outlet, Link } from "react-router-dom";

export default function Root() {
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
          <li>
            <Link to={`create`}>Create New Recipe</Link>
          </li>
          <li>
            <Link to={`register`}>Sign Up</Link>
          </li>
          <li>
            <Link to={`login`}>Login</Link>
          </li>
        </ul>
      </nav>
      <div>
        <Outlet />
      </div>
    </>
  );
}
