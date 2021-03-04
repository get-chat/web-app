import React, {useEffect, useState} from "react";
import '../styles/BusinessProfile.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {TextField} from "@material-ui/core";

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);
    const [data, setData] = useState({});
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');

    const getBusinessProfile = () => {
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig())
            .then((response) => {
                console.log(response.data);

                setData(response.data);
                setLoaded(true);

            })
            .catch((error) => {
                // TODO: Display error
            });
    }

    const updateBusinessProfile = async event => {
        event.preventDefault();


    }

    useEffect(() => {
        getBusinessProfile();
    }, []);

    return (
        <div className="businessProfileOuter">
            <div className="businessProfile">
                <h2>Business Profile</h2>

                {isLoaded
                    ?
                    <div className="businessProfile__fields">
                        {/*<form onSubmit={updateBusinessProfile}>*/}
                            <TextField value={address} onChange={e => setAddress(e.target.value)} label="Address" size="medium" fullWidth={true} />
                            <TextField value={description} onChange={e => setDescription(e.target.value)} label="Description" size="medium" fullWidth={true} />
                            <TextField value={email} onChange={e => setEmail(e.target.value)} label="E-mail" size="medium" fullWidth={true} />
                        {/*</form>*/}
                    </div>
                    :
                    <span>Loading</span>
                }
            </div>
        </div>
    )
}

export default BusinessProfile;