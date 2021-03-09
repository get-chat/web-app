import React from "react";
import '../styles/BusinessProfile.css';
import {IconButton} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";

function BusinessProfile(props) {
    return(
        <div className="sidebarBusinessProfile">
            <div className="sidebarBusinessProfile__header">
                <IconButton>
                    <ArrowBack />
                </IconButton>

                <span>Profile</span>
            </div>

            <div className="sidebarBusinessProfile__content">

            </div>
        </div>
    )
}

export default BusinessProfile;