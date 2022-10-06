import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../store";

import classes from "./AuthForm.module.css";
const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const emailRef = useRef();
    const passwordRef = useRef();
    const { authenticate, error } = useContext(AuthContext);
    const [hasError, setError] = useState();

    const switchAuthModeHandler = () => {
        setIsLogin((prevState) => !prevState);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        authenticate(
            emailRef.current.value,
            passwordRef.current.value,
            isLogin
        );
    };

    useEffect(() => {
        if (error) {
            setError(error);
        }
    }, [error]);

    return (
        <section className={classes.auth}>
            <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            <form onSubmit={submitHandler}>
                <div className={classes.control}>
                    <label htmlFor="email">Your Email</label>
                    <input type="email" id="email" ref={emailRef} required />
                </div>
                <div className={classes.control}>
                    <label htmlFor="password">Your Password</label>
                    <input
                        type="password"
                        id="password"
                        ref={passwordRef}
                        required
                    />
                </div>
                {hasError && <small style={{ color: "red" }}>{hasError}</small>}
                <div className={classes.actions}>
                    <button>{isLogin ? "Login" : "Create Account"}</button>
                    <button
                        type="button"
                        className={classes.toggle}
                        onClick={switchAuthModeHandler}
                    >
                        {isLogin
                            ? "Create new account"
                            : "Login with existing account"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default AuthForm;
