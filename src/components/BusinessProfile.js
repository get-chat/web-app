import React, {useEffect, useRef, useState} from "react";
import '../styles/BusinessProfile.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig, getLastKey, getObjLength} from "../Helpers";
import {Avatar, CircularProgress, FormControlLabel, IconButton, Radio, RadioGroup, TextField} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FileInput from "./FileInput";

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

    const [websiteKeyToDelete, setWebsiteKeyToDelete] = useState();

    const [open, setOpen] = React.useState(false);

    const fileInput = useRef();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getBusinessProfile = () => {
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig())
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

    const updateBusinessProfile = async event => {
        event.preventDefault();

        setUpdating(true);

        axios.patch( `${BASE_URL}settings/business/profile/`, {
            address: address,
            description: description,
            email: email,
            vertical: vertical,
            websites: Object.values(websites)
        }, getConfig())
            .then((response) => {
                console.log(response.data);

                // Update about
                updateAbout(event);

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

    const getAbout = () => {
        axios.get(`${BASE_URL}settings/profile/about/`, getConfig())
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

    const updateAbout = async event => {
        event.preventDefault();

        axios.patch( `${BASE_URL}settings/profile/about/`, {
            text: about
        }, getConfig())
            .then((response) => {
                console.log(response.data);

                setUpdating(false);

            })
            .catch((error) => {
                console.log(error);

                setUpdating(false);

                props.displayError(error);
            });
    }

    const getProfilePhoto = () => {
        axios.get(`${BASE_URL}settings/profile/photo/`, getConfig(undefined, undefined, 'arraybuffer'))
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

    useEffect(() => {
        getBusinessProfile();

        const handleKey = (event) => {
            // If any element is focused, ignore key
            if (document.activeElement.tagName === "INPUT") {
                return false;
            }

            if (event.keyCode === 27) { // Escape
                props.setBusinessProfileVisible(false);
            }
        };

        document.addEventListener('keydown', handleKey);

        return () => {
            document.removeEventListener('keydown', handleKey);
        }
    }, []);

    const verticalOptions = [
        "Automotive", "Beauty, Spa and Salon",
        "Clothing and Apparel",
        "Education",
        "Entertainment",
        "Event Planning and Service",
        "Finance and Banking",
        "Food and Grocery",
        "Public Service",
        "Hotel and Lodging",
        "Medical and Health",
        "Non-profit",
        "Professional Services",
        "Shopping and Retail",
        "Travel and Transportation",
        "Restaurant",
        "Other"
    ];

    const addWebsite = () => {
        setWebsites((prevState) => {
            const nextState = prevState;
            const nextKey = parseInt(getLastKey(websites)) + 1;
            nextState[nextKey] = "";
            return {...nextState};
        });
    }

    const updateWebsite = (event, key) => {
        setWebsites(prevState => {
            const nextState = prevState;
            nextState[key] = event.target.value;
            return {...nextState};
        });
    }

    const askToRemoveWebsite = (key) => {
        setWebsiteKeyToDelete(key);
        handleClickOpen();
    }

    const removeWebsite = () => {
        setWebsites(prevState => {
            const nextState = prevState;
            delete nextState[websiteKeyToDelete];

            const newObj = {};
            Object.entries(nextState).forEach((websiteEntry, index) => {
                newObj[index] = websiteEntry[1];
            });

            return {...newObj};
        });

        handleClose();
    }

    return (
        <div className="businessProfileOuter">

            <IconButton className="businessProfileOuter__closeIcon" onClick={() => props.setBusinessProfileVisible(false)}>
                <CloseIcon />
            </IconButton>

            <div className="businessProfile">
                <div className="businessProfile__header">
                    <h2>Business Profile</h2>
                </div>

                <Avatar src={profilePhoto ? "data:image/png;base64," + profilePhoto : ""} onClick={() => fileInput.current.click()} />

                <div className="businessProfile__fields">

                    <form onSubmit={updateBusinessProfile}>
                        <FileInput innerRef={fileInput} handleSelectedFiles={(file) => console.log(file)} accept="application/image" multiple={false} />

                        <TextField value={about} onChange={e => setAbout(e.target.value)} label="About" size="medium" multiline={true} fullWidth={true} />

                        <TextField value={address} onChange={e => setAddress(e.target.value)} label="Address" size="medium" fullWidth={true} />
                        <TextField value={description} onChange={e => setDescription(e.target.value)} label="Description" size="medium" fullWidth={true} />
                        <TextField value={email} onChange={e => setEmail(e.target.value)} label="E-mail" size="medium" fullWidth={true} />

                        <h5>Vertical</h5>

                        <RadioGroup row={true} className="businessProfile__fields__verticalOptions">

                            {verticalOptions.map((verticalOption, index) =>
                                <FormControlLabel
                                    key={index}
                                    label={verticalOption}
                                    value={verticalOption}
                                    checked={vertical === verticalOption}
                                    onChange={() => setVertical(verticalOption)}
                                    control={<Radio />} />
                            )}

                        </RadioGroup>

                        <h5>Websites</h5>

                        <div className="businessProfile__fields__websites">
                            {Object.entries(websites).map((website, index) =>

                                <div key={website[0]} className="businessProfile__fields__websites__wrapper">
                                    <TextField
                                        value={website[1]}
                                        label={"Website " + (parseInt(website[0]) + 1)}
                                        size="medium"
                                        fullWidth={true}
                                        onChange={(event) => updateWebsite(event, website[0])}/>

                                    {getObjLength(websites) > 1 &&
                                    <Button
                                        typeof="button"
                                        color="secondary"
                                        onClick={() => askToRemoveWebsite(website[0])}>Delete</Button>
                                    }
                                </div>
                            )}

                            <Button type="button" color="primary" onClick={addWebsite} disableElevation>Add another website</Button>
                        </div>

                        <Button className="businessProfile__submit" type="submit" color="primary" fullWidth={true} disabled={isUpdating} disableElevation>Update</Button>
                    </form>
                </div>

                <Dialog
                    open={open}
                    onClose={handleClose}>
                    <DialogTitle>{"Are you sure?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this website?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary">No</Button>
                        <Button onClick={removeWebsite} color="primary" autoFocus>Yes, delete</Button>
                    </DialogActions>
                </Dialog>

                {!isLoaded &&
                <div className="businessProfile__loading">
                    <CircularProgress color="primary" />
                </div>
                }

            </div>
        </div>
    )
}

export default BusinessProfile;