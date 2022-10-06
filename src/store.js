import { createContext, useCallback, useEffect, useState } from "react";
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
let logoutTimer;
const calculateRemainingTime = (expiry) => {
    const currentTime = new Date().getTime();
    const adjExpiryTime = new Date(expiry).getTime();
    return adjExpiryTime - currentTime;
};

const getStoredToken = () => {
    const storedToken = localStorage.getItem("token");
    const storedExpiration = localStorage.getItem("expirationTime");
    const remainingTime = calculateRemainingTime(storedExpiration);
    if (remainingTime <= 60000) {
        localStorage.removeItem("token");
        localStorage.removeItem("expirationTime");
        return null;
    } else
        return {
            token: storedToken,
            duration: remainingTime,
        };
};

export const AuthContextProvider = (props) => {
    // get token if present
    let initialToken;
    const tokenData = getStoredToken();
    if (tokenData) {
        initialToken = tokenData.token;
    }
    const [token, setToken] = useState(initialToken);
    const [error, setError] = useState();
    const userIsLoggedIn = !!token;
    const history = useHistory();

    // logout handler
    const logOutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("expirationTime");
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
        history.replace("/auth");
    }, [history]);
    useEffect(() => {
        if (tokenData) {
            logoutTimer = setTimeout(logOutHandler, tokenData.duration);
        }
    }, [tokenData, logOutHandler]);

    const loginHandler = (token, expiryTime) => {
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("expirationTime", expiryTime);
        history.replace("/");
        const expiresIn = calculateRemainingTime(expiryTime);
        logoutTimer = setTimeout(logOutHandler, expiresIn); // expire in 1 hour
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
                const convertedExpiry = new Date(
                    new Date().getTime() + +resp.expiresIn * 1000
                );
                loginHandler(resp.idToken, convertedExpiry.toISOString());
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
                const convertedExpiry = new Date(
                    new Date().getTime() + +res.expiresIn * 1000
                );
                loginHandler(res.idToken, convertedExpiry.toISOString());
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
