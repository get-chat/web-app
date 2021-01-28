import React, {useEffect, useState} from 'react';
import '../styles/Login.css';
import {Backdrop, CircularProgress, Fade, TextField} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import {getConfig, getToken, setToken} from "../Helpers";

const BASE_URL = 'https://whatsapp.kondz.io/api/v1/';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function Login() {

    const classes = useStyles();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggingIn, setLoggingIn] = useState(false);
    const[isValidatingToken, setValidatingToken] = useState(false);

    const history = useHistory();

    useEffect(() => {
        const token = getToken();
        if (token) {
            setValidatingToken(true);
            axios.get(BASE_URL, getConfig())
                .then((response) => {
                    // Redirect to main route
                    history.push("/main");
                })
                .catch((error) => {
                    setValidatingToken(false);

                    // TODO: Make sure the response is Unauthorized
                    setToken(null);
                })
        }
    }, []);

    const doLogin = async e => {
        e.preventDefault();

        // Check if username or password is empty
        if (username.trim() === "" || password.trim() === "") {
            alert("Empty");
            return false;
        }

        // Display the loading animation
        setLoggingIn(true);

        axios.post(BASE_URL + 'auth/token/', {
            username : username,
            password : password
        }).then((response) => {
            // Store token in local storage
            setToken(response.data.token);

            // Redirect to main route
            history.push("/main");
        }).catch((error) => {

            // Hide the loading animation
            setLoggingIn(false);

            // Handle the error
            if (error.response) {
                // Request made and server responded
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        })
    }

    return (
        <div className="login">

            <Fade in={true}>
                <div className="login__body">
                    <h2>Welcome</h2>
                    <p>Please login to start</p>

                    <form onSubmit={doLogin}>
                        <TextField value={username} onChange={e => setUsername(e.target.value)} label="Username" size="medium" fullWidth={true} />
                        <TextField value={password} onChange={e => setPassword(e.target.value)} type="password" label="Password" size="medium" fullWidth={true} />
                        <Button type="submit" color="primary" fullWidth={true} disableElevation>Login</Button>
                    </form>

                    {isValidatingToken &&
                    <div className="login__validatingToken">
                        <h2>Welcome</h2>
                        <p>We are validating your session, please wait.</p>
                    </div>
                    }
                </div>
            </Fade>

            <Backdrop className={classes.backdrop} open={isLoggingIn}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </div>
    )
}