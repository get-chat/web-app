import React, {useEffect, useState} from "react";
import '../styles/BusinessProfile.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {IconButton, TextField} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [vertical, setVertical] = useState('');

    const getBusinessProfile = () => {
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig())
            .then((response) => {
                console.log(response.data);

                const data = response.data;

                setAddress(data.address);
                setDescription(data.description);
                setEmail(data.email);

                setLoaded(true);

            })
            .catch((error) => {
                // TODO: Display error
            });
    }

    const updateBusinessProfile = async event => {
        event.preventDefault();

        axios.patch( `${BASE_URL}settings/business/profile/`, {
            address: address,
            description: description,
            email: email,
            vertical: vertical,
            websites: []
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

    return (
        <div className="businessProfileOuter">

            <IconButton className="businessProfileOuter__closeIcon" onClick={() => props.setBusinessProfileVisible(false)}>
                <CloseIcon />
            </IconButton>

            <div className="businessProfile">
                <div className="businessProfile__header">
                    <h2>Business Profile</h2>
                </div>

                {isLoaded
                    ?
                    <div className="businessProfile__fields">
                        <form onSubmit={updateBusinessProfile}>
                            <TextField value={address} onChange={e => setAddress(e.target.value)} label="Address" size="medium" fullWidth={true} />
                            <TextField value={description} onChange={e => setDescription(e.target.value)} label="Description" size="medium" fullWidth={true} />
                            <TextField value={email} onChange={e => setEmail(e.target.value)} label="E-mail" size="medium" fullWidth={true} />

                            <Button type="submit" color="primary" fullWidth={true} disableElevation>Update</Button>
                        </form>
                    </div>
                    :
                    <span>Loading</span>
                }
            </div>
        </div>
    )
}

export default BusinessProfile;