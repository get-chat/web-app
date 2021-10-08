import React from "react";
import Login from "./components/Login";
import {ThemeProvider} from '@material-ui/styles';
import {BrowserRouter as Router, Route, Switch as RouteSwitch} from "react-router-dom";
import Main from "./components/Main/Main";
import AppTheme from "./AppTheme";
import {isIPad13} from "react-device-detect";

function App() {

    return (
        <ThemeProvider theme={AppTheme}>
            <div className={"app" + (isIPad13 ? " absoluteFullscreen" : "")}>
                <Router>
                    <RouteSwitch>
                        <Route path={["/main/chat/:waId", "/main/chat/:waId/message/:msgId", "/main"]} component={Main} />
                        <Route path={["/login/error/:errorCase", "/"]} component={Login} />
                    </RouteSwitch>
                </Router>
            </div>
        </ThemeProvider>
    );
}

export default App;