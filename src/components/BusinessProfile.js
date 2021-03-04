import React, {useEffect, useState} from "react";
import '../styles/BusinessProfile.css';

function BusinessProfile(props) {

    const [isLoaded, setLoaded] = useState(false);

    const getBusinessProfile = () => {

    }

    useEffect(() => {
        getBusinessProfile();
    }, []);

    return (
        <div className="businessProfile">
            <h2>Business Profile</h2>

            {isLoaded
            ?
                <div>
                    Content
                </div>
            :
                <span>Loading</span>
            }
        </div>
    )
}

export default BusinessProfile;