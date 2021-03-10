import React, {useEffect, useRef, useState} from "react";
import '../styles/BusinessProfile.css';
import {Avatar, IconButton} from "@material-ui/core";
import {ArrowBack, Edit} from "@material-ui/icons";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {avatarStyles} from "../AvatarStyles";

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);
    const [isUpdating, setUpdating] = useState(false);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [vertical, setVertical] = useState('');
    const [websites, setWebsites] = useState({});
    const [about, setAbout] = useState('');
    const [profilePhoto, setProfilePhoto] = useState();

    const fileInput = useRef();

    let cancelTokenSource;

    const generateCancelToken = () => {
        cancelTokenSource = axios.CancelToken.source();
    }

    const avatarClasses = avatarStyles();

    useEffect(() => {
        // Generating cancel token
        generateCancelToken();

        getBusinessProfile();

        return () => {
            cancelTokenSource.cancel();
        }
    }, []);

    const getBusinessProfile = () => {
        console.log(cancelTokenSource);
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig(undefined, cancelTokenSource.token))
            .then((response) => {
                console.log(response.data);

                const data = response.data;

                setAddress(data.address);
                setDescription(data.description);
                setEmail(data.email);
                setVertical(data.vertical);

                let websitesArray = data.websites;
                if (websitesArray.length === 0) {
                    websitesArray = [""];
                }

                setWebsites({...websitesArray});

                // Load about
                getAbout();

            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const getAbout = () => {
        axios.get(`${BASE_URL}settings/profile/about/`, getConfig(undefined, cancelTokenSource.token))
            .then((response) => {
                console.log(response.data);

                const profile = response.data.settings?.profile;

                setAbout(profile?.about?.text);

                getProfilePhoto();

            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const getProfilePhoto = () => {
        axios.get(`${BASE_URL}settings/profile/photo/`, getConfig(undefined, cancelTokenSource.token, 'arraybuffer'))
            .then((response) => {
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                setProfilePhoto(base64);

                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    const updateProfilePhoto = async (file) => {
        const formData = new FormData();
        formData.append("file_encoded", file[0]);

        axios.post( `${BASE_URL}settings/profile/photo/`, formData, getConfig(undefined, cancelTokenSource.token))
            .then((response) => {
                console.log(response.data);

                setUpdating(false);

                // Display new photo
                getProfilePhoto();

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

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
                        <div className="sidebarBusinessProfile__body__avatarContainer">
                            <Avatar className={avatarClasses[props.currentUser.username[0].toUpperCase()]}>{props.currentUser.username[0].toUpperCase()}</Avatar>
                        </div>

                        <h3>{props.currentUser.username}</h3>
                        <span>{props.currentUser.first_name + ' ' + props.currentUser.last_name}</span>
                    </div>
                    }
                </div>

                <div className="sidebarBusinessProfile__body__section">
                    <div className="sidebarBusinessProfile__body__section__header">
                        <h3>Business Profile</h3>
                        <IconButton onClick={props.displayEditBusinessProfile}>
                            <Edit />
                        </IconButton>
                    </div>

                    {!isLoaded &&
                    <div>Loading</div>
                    }

                    {isLoaded &&
                    <div className="sidebarBusinessProfile__body__section__subSection">
                        <div>

                            {/*<FileInput innerRef={fileInput} handleSelectedFiles={(file) => updateProfilePhoto(file)} accept="image/jpeg, image/png" multiple={false} />*/}

                            <div className="sidebarBusinessProfile__body__avatarContainer">
                                <Avatar src={profilePhoto ? "data:image/png;base64," + profilePhoto : undefined}>?</Avatar>
                            </div>

                            <h5>About</h5>
                            {about}
                        </div>
                        <div>
                            <h5>Address</h5>
                            {address}
                        </div>
                        <div>
                            <h5>Description</h5>
                            {description}
                        </div>
                        <div>
                            <h5>E-mail</h5>
                            {email}
                        </div>
                        <div>
                            <h5>Vertical</h5>
                            {vertical}
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default BusinessProfile;