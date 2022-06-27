import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/BusinessProfile.css';
import {
    Avatar,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { generateInitialsHelper } from '../../../helpers/Helpers';
import FileInput from '../../FileInput';
import { generateAvatarColor } from '../../../helpers/AvatarHelper';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { generateCancelToken } from '../../../helpers/ApiHelper';
import { binaryToBase64 } from '../../../helpers/ImageHelper';

function BusinessProfile(props) {
    const { apiService } = React.useContext(ApplicationContext);

    const { t, i18n } = useTranslation();

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

    const cancelTokenSourceRef = useRef();

    useEffect(() => {
        const handleKey = (event) => {
            if (event.keyCode === 27) {
                // Escape
                props.onHide();
            }
        };

        document.addEventListener('keydown', handleKey);

        // Generate a token
        cancelTokenSourceRef.current = generateCancelToken();

        retrieveBusinessProfile();

        return () => {
            document.removeEventListener('keydown', handleKey);
            cancelTokenSourceRef.current.cancel();
        };
    }, []);

    const retrieveBusinessProfile = () => {
        apiService.retrieveBusinessProfileCall(
            cancelTokenSourceRef.current.token,
            (response) => {
                const data = response.data;

                setAddress(data.address);
                setDescription(data.description);
                setEmail(data.email);
                setVertical(data.vertical);

                let websitesArray = data.websites;
                if (websitesArray.length === 0) {
                    websitesArray = [];
                }

                setWebsites({ ...websitesArray });

                // Load about
                retrieveProfileAbout();
            }
        );
    };

    const updateBusinessProfile = async (event) => {
        event.preventDefault();

        setUpdating(true);

        apiService.updateBusinessProfileCall(
            address,
            description,
            email,
            vertical,
            Object.values(websites),
            cancelTokenSourceRef.current.token,
            (response) => {
                updateProfileAbout(event);
            },
            (error) => {
                setUpdating(false);
            }
        );
    };

    const retrieveProfileAbout = () => {
        apiService.retrieveProfileAboutCall(
            cancelTokenSourceRef.current.token,
            (response) => {
                const profile = response.data.settings?.profile;
                setAbout(profile?.about?.text);
                retrieveProfilePhoto();
            }
        );
    };

    const updateProfileAbout = async (event) => {
        event.preventDefault();

        apiService.updateProfileAboutCall(
            about,
            cancelTokenSourceRef.current.token,
            (response) => {
                setUpdating(false);
            },
            (error) => {
                setUpdating(false);
            }
        );
    };

    const retrieveProfilePhoto = () => {
        apiService.retrieveProfilePhotoCall(
            cancelTokenSourceRef.current.token,
            (response) => {
                const base64 = binaryToBase64(response.data);
                setProfilePhoto(base64);

                // Finish
                setLoaded(true);
            },
            (error) => {
                // No photo
                if (error?.response?.status === 404) {
                    // Finish
                    setLoaded(true);
                } else {
                    window.displayError(error);
                }
            }
        );
    };

    const updateProfilePhoto = async (file) => {
        const formData = new FormData();
        formData.append('file_encoded', file[0]);

        apiService.updateProfilePhotoCall(
            formData,
            cancelTokenSourceRef.current.token,
            (response) => {
                setUpdating(false);

                // Display new photo
                retrieveProfilePhoto();
            },
            (error) => {
                setUpdating(false);
            }
        );
    };

    const deleteProfilePhoto = () => {
        apiService.deleteProfilePhotoCall(
            cancelTokenSourceRef.current.token,
            (response) => {
                setProfilePhoto(undefined);
            }
        );
    };

    const verticalOptions = [
        'Automotive',
        'Beauty, Spa and Salon',
        'Clothing and Apparel',
        'Education',
        'Entertainment',
        'Event Planning and Service',
        'Finance and Banking',
        'Food and Grocery',
        'Public Service',
        'Hotel and Lodging',
        'Medical and Health',
        'Non-profit',
        'Professional Services',
        'Shopping and Retail',
        'Travel and Transportation',
        'Restaurant',
        'Other',
    ];

    const handleBusinessProfileAvatarClick = () => {
        if (props.isAdmin) fileInput.current.click();
    };

    return (
        <div className="sidebarBusinessProfile">
            <div className="sidebarBusinessProfile__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>{t('Profile')}</h3>
            </div>

            <div className="sidebarBusinessProfile__body">
                <div className="sidebarBusinessProfile__body__section">
                    {props.currentUser && (
                        <div>
                            <div className="sidebarBusinessProfile__body__section__header">
                                <h5>{t('Personal Profile')}</h5>
                            </div>

                            <div className="sidebarBusinessProfile__body__avatarContainer">
                                <Avatar
                                    src={
                                        props.currentUser?.profile
                                            ?.large_avatar ??
                                        props.currentUser?.profile?.avatar
                                    }
                                    style={{
                                        backgroundColor: generateAvatarColor(
                                            props.currentUser.username
                                        ),
                                    }}
                                >
                                    {generateInitialsHelper(
                                        props.currentUser.username
                                    )}
                                </Avatar>
                            </div>

                            <h3>{props.currentUser.username}</h3>
                            <span>
                                {props.currentUser.first_name +
                                    ' ' +
                                    props.currentUser.last_name}
                            </span>

                            <div className="sidebarBusinessProfile__body__changePasswordContainer">
                                <Button
                                    onClick={() =>
                                        props.setChangePasswordDialogVisible(
                                            true
                                        )
                                    }
                                    color="secondary"
                                >
                                    {t('Change password')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebarBusinessProfile__body__section">
                    <div className="sidebarBusinessProfile__body__section__header">
                        <h5>{t('Business Profile')}</h5>
                    </div>

                    {!isLoaded && <span>{t('Loading')}</span>}

                    {isLoaded && (
                        <div className="sidebarBusinessProfile__body__section__subSection">
                            <div
                                className={
                                    'sidebarBusinessProfile__body__avatarContainer' +
                                    (props.isAdmin ? ' editable' : '')
                                }
                            >
                                <FileInput
                                    innerRef={fileInput}
                                    handleSelectedFiles={(file) =>
                                        updateProfilePhoto(file)
                                    }
                                    accept="image/jpeg, image/png"
                                    multiple={false}
                                />
                                <Avatar
                                    src={
                                        profilePhoto
                                            ? 'data:image/png;base64,' +
                                              profilePhoto
                                            : undefined
                                    }
                                    onClick={handleBusinessProfileAvatarClick}
                                />

                                {profilePhoto && (
                                    <div
                                        className={
                                            'sidebarBusinessProfile__body__avatarContainer__info'
                                        }
                                    >
                                        {t(
                                            'On WhatsApp, your business profile photo has bigger resolution than shown here.'
                                        )}
                                    </div>
                                )}

                                {profilePhoto && props.isAdmin && (
                                    <Button
                                        onClick={deleteProfilePhoto}
                                        color="secondary"
                                    >
                                        Delete profile photo
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={updateBusinessProfile}>
                                <div>
                                    <TextField
                                        value={about}
                                        onChange={(e) =>
                                            setAbout(e.target.value)
                                        }
                                        label={t('About')}
                                        size="medium"
                                        multiline={true}
                                        fullWidth={true}
                                        InputProps={{
                                            readOnly: !props.isAdmin,
                                        }}
                                    />
                                    <TextField
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        label={t('Address')}
                                        size="medium"
                                        fullWidth={true}
                                        InputProps={{
                                            readOnly: !props.isAdmin,
                                        }}
                                    />
                                    <TextField
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        label={t('Description')}
                                        size="medium"
                                        fullWidth={true}
                                        InputProps={{
                                            readOnly: !props.isAdmin,
                                        }}
                                    />
                                    <TextField
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        label={t('E-mail')}
                                        size="medium"
                                        fullWidth={true}
                                        InputProps={{
                                            readOnly: !props.isAdmin,
                                        }}
                                    />

                                    <FormControl
                                        fullWidth={true}
                                        disabled={!props.isAdmin}
                                    >
                                        <InputLabel id="vertical-label">
                                            {t('Vertical')}
                                        </InputLabel>
                                        <Select
                                            value={vertical}
                                            onChange={(event) =>
                                                setVertical(event.target.value)
                                            }
                                            labelId="vertical-label"
                                        >
                                            <MenuItem value="">
                                                {t('None')}
                                            </MenuItem>

                                            {verticalOptions.map(
                                                (verticalOption, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        value={verticalOption}
                                                    >
                                                        {verticalOption}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>
                                </div>

                                {props.isAdmin && (
                                    <div className="sidebarBusinessProfile__body__section__subSection__action">
                                        <Button
                                            type="submit"
                                            disabled={isUpdating}
                                            color="primary"
                                            size="large"
                                        >
                                            {t('Update')}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BusinessProfile;
