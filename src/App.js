import React from "react";
import Login from "./components/Login";
import {ThemeProvider} from '@material-ui/styles';
import {BrowserRouter as Router, Route, Switch as RouteSwitch} from "react-router-dom";
import Main from "./components/Main";
import AppTheme from "./AppTheme";

function App() {

    return (
        <ThemeProvider theme={AppTheme}>
            <div className="app">
                <Router>
                    <RouteSwitch>
                        <Route path={["/main/chat/:waId", "/main/chat/:waId/message/:msgId", "/main"]} component={Main} />
                        <Route path="/" component={Login} />
                    </RouteSwitch>
                </Router>
            </div>
        </ThemeProvider>
    );
}

export default App;