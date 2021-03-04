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
    const [vertical, setVertical] = useState({});

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
            vertical: vertical
        }, getConfig())
            .then((response) => {
                //console.log(response.data);

                console.log('Updated');
            })
            .catch((error) => {
                // TODO: Handle errors

                props.displayError(error);
            });
    }

    useEffect(() => {
        getBusinessProfile();
    }, []);

    return (
        <div className="businessProfileOuter">
            <div className="businessProfile">

                <div className="businessProfile__header">
                    <h2>Business Profile</h2>
                    <IconButton>
                        <CloseIcon />
                    </IconButton>
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