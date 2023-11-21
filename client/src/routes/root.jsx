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
                    <li>Link 3</li>
                </ul></nav>
            <div>
                <Outlet />
            </div>
        </>
    )
}