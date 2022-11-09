import React, { useEffect, useRef, useState } from 'react';
import '../styles/Contacts.css';
import SearchBar from './SearchBar';
import {
	Button,
	CircularProgress,
	Collapse,
	IconButton,
	InputAdornment,
	ListItem,
	TextField,
} from '@material-ui/core';
import { ArrowBack, ExpandLess, ExpandMore } from '@material-ui/icons';
import DialpadIcon from '@material-ui/icons/Dialpad';
import Contact from './Contact';
import ContactModel from '../api/models/ContactModel';
import { isMobileOnly } from 'react-device-detect';
import { useHistory } from 'react-router-dom';
import PersonModel from '../api/models/PersonModel';
import Person from './Person';
import { getObjLength } from '../helpers/ObjectHelper';
import { addPlus, preparePhoneNumber } from '../helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import { ApplicationContext } from '../contexts/ApplicationContext';
import { generateCancelToken } from '../helpers/ApiHelper';

function Contacts(props) {
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const [keyword, setKeyword] = useState('');
	const [contacts, setContacts] = useState({});
	const [persons, setPersons] = useState({});
	const [isLoading, setLoading] = useState(false);
	const [isVerifying, setVerifying] = useState(false);
	const [isPhoneNumberFormVisible, setPhoneNumberFormVisible] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [isPersonsVisible, setPersonsVisible] = useState(true);
	const [isContactsVisible, setContactsVisible] = useState(true);

	let cancelTokenSourceRef = useRef();
	let verifyPhoneNumberCancelTokenSourceRef = useRef();

	const history = useHistory();

	useEffect(() => {
		const handleKey = (event) => {
			if (event.keyCode === 27) {
				// Escape
				props.onHide();
			}
		};

		document.addEventListener('keydown', handleKey);

		verifyPhoneNumberCancelTokenSourceRef.current = generateCancelToken();

		return () => {
			document.removeEventListener('keydown', handleKey);
			cancelTokenSourceRef.current.cancel();
			verifyPhoneNumberCancelTokenSourceRef.current.cancel();
		};
	}, []);

	let timeout = useRef();

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		setLoading(true);

		timeout.current = setTimeout(function () {
			listPersons();
		}, 500);

		return () => {
			cancelTokenSourceRef.current.cancel();
			clearTimeout(timeout.current);
			setLoading(false);
		};
	}, [keyword]);

	const listPersons = () => {
		apiService.listPersonsCall(
			keyword?.trim(),
			cancelTokenSourceRef.current.token,
			(response) => {
				const preparedPersons = {};
				response.data.results.forEach((person, personIndex) => {
					preparedPersons[personIndex] = new PersonModel(person);
				});
				setPersons(preparedPersons);
				listContacts();
			},
			(error) => {
				setLoading(false);
			}
		);
	};

	const listContacts = () => {
		apiService.listContactsCall(
			keyword?.trim(),
			0,
			cancelTokenSourceRef.current.token,
			(response) => {
				const preparedContacts = {};
				response.data.results.forEach((contact, contactIndex) => {
					preparedContacts[contactIndex] = new ContactModel(contact);
				});
				setContacts(preparedContacts);
				setLoading(false);
			},
			(error) => {
				setLoading(false);
			}
		);
	};

	const verifyContact = (data, waId) => {
		waId = preparePhoneNumber(waId);

		setVerifying(true);

		apiService.verifyContactsCall(
			[addPlus(waId)],
			verifyPhoneNumberCancelTokenSourceRef.current.token,
			(response) => {
				if (
					response.data.contacts &&
					response.data.contacts.length > 0 &&
					response.data.contacts[0].status === 'valid'
				) {
					history.push({
						pathname: `/main/chat/${waId}`,
						person: {
							name: data?.name,
							initials: data?.initials,
							avatar: data?.avatar,
							waId: waId,
						},
					});

					// Hide contacts on mobile
					if (isMobileOnly) {
						props.onHide();
					}
				} else {
					window.displayCustomError(
						'There is no WhatsApp account connected to this phone number.'
					);
				}

				setVerifying(false);
			},
			(error) => {
				setVerifying(false);
			}
		);
	};

	return (
		<div className="contacts">
			<div className="contacts__header">
				<IconButton onClick={props.onHide}>
					<ArrowBack />
				</IconButton>

				<h3>{t('New chat')}</h3>
			</div>

			<div className="contacts__startByPhoneNumberWrapper">
				<div
					className="contacts__startByPhoneNumber"
					onClick={() => setPhoneNumberFormVisible((prevState) => !prevState)}
				>
					<ListItem button>
						<div
							className="contacts__startByPhoneNumber__inner"
							data-test-id="start-new-chat"
						>
							<DialpadIcon />
							<span>{t('Start a chat with a phone number')}</span>
						</div>
					</ListItem>
				</div>

				{isPhoneNumberFormVisible && (
					<div className="contacts__startByPhoneNumberWrapper__formWrapper">
						<TextField
							label={t('Phone number')}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">+</InputAdornment>
								),
							}}
							onChange={(event) => setPhoneNumber(event.target.value)}
						/>
						<Button
							color="primary"
							onClick={() => verifyContact(undefined, phoneNumber)}
							data-test-id="start-chat-by-phone"
						>
							{t('Start')}
						</Button>
					</div>
				)}
			</div>

			<SearchBar
				placeholder="Search for contacts"
				onChange={setKeyword}
				isLoading={isLoading}
			/>

			<div className="contacts__body">
				{getObjLength(persons) > 0 && (
					<div className="contacts__body__headerWrapper">
						<h3>{'Persons'}</h3>
						<IconButton
							onClick={() => setPersonsVisible((prevState) => !prevState)}
						>
							{isPersonsVisible ? <ExpandLess /> : <ExpandMore />}
						</IconButton>
					</div>
				)}

				<Collapse in={isPersonsVisible} data-test-id="contacts-list">
					{Object.entries(persons).map((person, index) => (
						<Person
							key={index}
							data={person[1]}
							verifyPhoneNumber={verifyContact}
							onHide={props.onHide}
							contactProvidersData={props.contactProvidersData}
						/>
					))}
				</Collapse>

				{getObjLength(contacts) > 0 && (
					<div className="contacts__body__headerWrapper">
						<h3>{'Contacts'}</h3>
						<IconButton
							onClick={() => setContactsVisible((prevState) => !prevState)}
						>
							{isContactsVisible ? <ExpandLess /> : <ExpandMore />}
						</IconButton>
					</div>
				)}

				<Collapse in={isContactsVisible}>
					{Object.entries(contacts).map((contact, index) => (
						<Contact
							key={index}
							data={contact[1]}
							verifyPhoneNumber={verifyContact}
							onHide={props.onHide}
						/>
					))}
				</Collapse>

				{isVerifying && (
					<div className="contacts__body__loading">
						<CircularProgress color="inherit" />
					</div>
				)}

				{!isLoading &&
					keyword?.length > 0 &&
					getObjLength(persons) === 0 &&
					getObjLength(contacts) === 0 && (
						<span className="contacts__body__hint">
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [keyword],
								}}
							>
								No persons or contacts found for{' '}
								<span className="searchOccurrence">%s</span>
							</Trans>
						</span>
					)}
			</div>
		</div>
	);
}

export default Contacts;
