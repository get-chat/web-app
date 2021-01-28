const getToken = () => {
    return localStorage.getItem("token");
}

const getConfig = (params) => {
    return {
        params,
        headers: {
            'Authorization': 'Token ' + getToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
}

const setToken = (token) => {
    localStorage.setItem("token", token);
}

export {getToken, getConfig, setToken};