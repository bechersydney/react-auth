import { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import AuthContext from "../../store";

import classes from "./MainNavigation.module.css";

const MainNavigation = () => {
    const history = useHistory();
    const { isLoggedIn, logout } = useContext(AuthContext);
    const logOutHandler = () => {
        logout();
        history.replace("/auth");
    };
    return (
        <header className={classes.header}>
            <Link to="/">
                <div className={classes.logo}>React Auth</div>
            </Link>
            <nav>
                <ul>
                    {!isLoggedIn && (
                        <li>
                            <Link to="/auth">Login</Link>
                        </li>
                    )}

                    {isLoggedIn && (
                        <>
                            <li>
                                <Link to="/profile">Profile</Link>
                            </li>
                            <li>
                                <button onClick={logOutHandler}>Logout</button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default MainNavigation;
