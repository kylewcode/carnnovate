import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Root() {
    const { loginWithRedirect, logout } = useAuth0();

    return (
        <>
            <nav>
                <h1>Carnnovate</h1>
                <ul>
                    <li>
                        <button type="button" onClick={() => loginWithRedirect()}>Log In</button>
                    </li>
                    <li>
                        <button type="button" onClick={() => logout({ logoutParams: { returnTo: "http://localhost:5173/search" } })}>Log Out</button>
                    </li>
                    <li>
                        <Link to={`/`}>Home</Link>
                    </li>
                    <li>
                        <Link to={`search`}>Search</Link>
                    </li>
                    <li>
                        <Link to={`create`}>Create New Recipe</Link>
                    </li>
                </ul></nav>
            <div>
                <Outlet />
            </div>
        </>
    )
}