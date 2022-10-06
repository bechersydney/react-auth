import { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../../store";
import classes from "./ProfileForm.module.css";

const ProfileForm = () => {
    const passRef = useRef();
    const [hasError, setError] = useState();
    const history = useHistory();
    const { changePass, error } = useContext(AuthContext);

    const onResetPassHandler = (e) => {
        e.preventDefault();
        const isAuthenticated = changePass(passRef.current.value);
        if (isAuthenticated) {
            history.replace("/");
        }
    };

    useEffect(() => {
        if (error) {
            setError(error);
        }
    }, [error]);
    return (
        <form className={classes.form} onSubmit={onResetPassHandler}>
            <div className={classes.control}>
                <label htmlFor="new-password">New Password</label>
                <input type="password" id="new-password" ref={passRef} />
            </div>
            {hasError && <small style={{ color: "red" }}>{error}</small>}
            <div className={classes.action}>
                <button>Change Password</button>
            </div>
        </form>
    );
};

export default ProfileForm;
