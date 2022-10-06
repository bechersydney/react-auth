import { createContext, useState } from "react";
import { useHistory } from "react-router-dom";

const AuthContext = createContext({
    isLoggedIn: false,
    token: "",
    logout: () => {},
    authenticate: (email, pass, isLoggedIn) => {},
    error: "",
    changePass: (token) => {},
});

export default AuthContext;
const API_KEY = "AIzaSyBWzFyXq7TX9Kuc83tGPZu_n9xbbYlWzCM";
export const AuthContextProvider = (props) => {
    const [token, setToken] = useState();
    const [error, setError] = useState();
    const userIsLoggedIn = !!token;
    const history = useHistory();
    // logout handler
    const logOutHandler = () => {
        setToken(null);
        history.replace("/auth");
    };

    const authenticate = async (email, password, isLogin) => {
        let url = "";
        if (isLogin) {
            url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
        } else {
            url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
        }
        try {
            const res = await fetch(url, {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resp = await res.json();
            if (res.ok) {
                setToken(resp.idToken);
                history.replace("/");
            } else {
                let errorMessage = "Authentication Failed!";
                // if (resp && resp.error && resp.error.message) {
                //     errorMessage = data.error.message;
                // }
                throw new Error(errorMessage);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const changePassHandler = async (password) => {
        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        idToken: token,
                        password,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const res = await response.json();
            if (response.ok) {
                setToken(res.idToken);
            } else {
                throw new Error("Resseting password failed!");
            }
        } catch (err) {
            setError(err.message);
        }
        return userIsLoggedIn;
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: userIsLoggedIn,
                token,
                logout: logOutHandler,
                error,
                authenticate,
                changePass: changePassHandler,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};
