import React from "react";
import '../styles/BusinessProfile.css';
import {IconButton} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";

function BusinessProfile(props) {
    return(
        <div className="sidebarBusinessProfile">
            <div className="sidebarBusinessProfile__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>Profile</h3>
            </div>

            <div className="sidebarBusinessProfile__body">
                <div className="sidebarBusinessProfile__body__section">
                    {props.currentUser &&
                    <div>
                        <h3>{props.currentUser.username}</h3>
                        <span>{props.currentUser.first_name + ' ' + props.currentUser.last_name}</span>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default BusinessProfile;