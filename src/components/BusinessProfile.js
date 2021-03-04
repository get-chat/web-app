import React, {useEffect, useState} from "react";
import '../styles/BusinessProfile.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig, getObjLength} from "../Helpers";
import {CircularProgress, FormControlLabel, IconButton, Radio, RadioGroup, TextField} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [vertical, setVertical] = useState('');
    const [websites, setWebsites] = useState({});

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

                setLoaded(true);

            })
            .catch((error) => {
                // TODO: Display error
                console.log(error);
            });
    }

    const updateBusinessProfile = async event => {
        event.preventDefault();

        axios.patch( `${BASE_URL}settings/business/profile/`, {
            address: address,
            description: description,
            email: email,
            vertical: vertical,
            websites: Object.values(websites)
        }, getConfig())
            .then((response) => {
                console.log(response.data);

            })
            .catch((error) => {
                // TODO: Handle errors

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
            nextState[getObjLength(nextState)] = "";
            return {...nextState};
        })
    }

    const updateWebsite = (event, key) => {
        setWebsites(prevState => {
            const nextState = prevState;
            nextState[key] = event.target.value;
            return {...nextState};
        })
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

                <div className="businessProfile__fields">

                    <form onSubmit={updateBusinessProfile}>
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
                                <TextField
                                    key={website[0]}
                                    value={website[1]}
                                    label={"Website " + (parseInt(website[0]) + 1)}
                                    size="medium"
                                    fullWidth={true}
                                    onChange={(event) => updateWebsite(event, website[0])}/>
                            )}

                            <Button type="button" color="primary" onClick={addWebsite} disableElevation>Add</Button>
                        </div>

                        <Button className="businessProfile__submit" type="submit" color="primary" fullWidth={true} disableElevation>Update</Button>
                    </form>
                </div>

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