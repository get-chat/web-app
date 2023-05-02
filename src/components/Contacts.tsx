// @ts-nocheck
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
} from '@mui/material';
import { ArrowBack, ExpandLess, ExpandMore } from '@mui/icons-material';
import DialpadIcon from '@mui/icons-material/Dialpad';
import Contact from './Contact';
import { useNavigate } from 'react-router-dom';
import PersonModel from '../api/models/PersonModel';
import Person from './Person';
import { getObjLength } from '../helpers/ObjectHelper';
import { addPlus, prepareWaId } from '../helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import { ApplicationContext } from '../contexts/ApplicationContext';
import { generateCancelToken } from '../helpers/ApiHelper';
import ContactsResponse from '@src/api/responses/ContactsResponse';
import { CONTACTS_TEMP_LIMIT } from '@src/Constants';
import Recipient from '@src/api/models/interfaces/Recipient';
import RecipientItem from '@src/components/RecipientItem';

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

	const [unifiedList, setUnifiedList] = useState<Recipient>([]);

	let cancelTokenSourceRef = useRef();
	let verifyPhoneNumberCancelTokenSourceRef = useRef();
	let timeout = useRef();

	const navigate = useNavigate();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				props.onHide();
				event.stopPropagation();
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

	useEffect(() => {
		// Creating a unified list and sorting alphabetically
		setUnifiedList(
			[...Object.values(persons), ...Object.values(contacts)].sort(function (
				a: Recipient,
				b: Recipient
			) {
				return (
					a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase()) ?? -1
				);
			})
		);
	}, [contacts, persons]);

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
			() => {
				setLoading(false);
			}
		);
	};

	const listContacts = () => {
		apiService.listContactsCall(
			keyword?.trim(),
			CONTACTS_TEMP_LIMIT,
			undefined,
			cancelTokenSourceRef.current.token,
			(response) => {
				const contactsResponse = new ContactsResponse(response.data);
				setContacts(contactsResponse.contacts);
				setLoading(false);
			},
			() => {
				setLoading(false);
			}
		);
	};

	const verifyContact = (data?: Recipient, phoneNumber: string) => {
		const failureCallback = () => {
			window.displayCustomError(
				'There is no WhatsApp account connected to this phone number.'
			);
		};

		const waId = prepareWaId(phoneNumber);

		if (!waId) {
			failureCallback();
			return;
		}

		setVerifying(true);

		apiService.verifyContactsCall(
			[addPlus(waId)],
			verifyPhoneNumberCancelTokenSourceRef.current.token,
			(response) => {
				if (
					response.data.contacts &&
					response.data.contacts.length > 0 &&
					response.data.contacts[0].status === 'valid' &&
					response.data.contacts[0].wa_id !== 'invalid'
				) {
					const returnedWaId = response.data.contacts[0].wa_id;

					navigate(`/main/chat/${returnedWaId}`, {
						state: {
							person: {
								name: data?.name,
								initials: data?.initials,
								avatar: data?.avatar,
								waId: returnedWaId,
							},
						},
					});

					// Hide contacts
					props.onHide();
				} else {
					failureCallback();
				}

				setVerifying(false);
			},
			() => {
				setVerifying(false);
			}
		);
	};

	return (
		<div className="contacts">
			<div className="contacts__header">
				<IconButton onClick={props.onHide} size="large">
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
							variant="standard"
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
				placeholder={t('Search for contacts')}
				onChange={setKeyword}
				isLoading={isLoading}
			/>

			<div className="contacts__body">
				{unifiedList.map((item, index) => (
					<RecipientItem
						key={index}
						data={item}
						verifyPhoneNumber={(phoneNumber: string, data: Recipient) =>
							verifyContact(data, phoneNumber)
						}
					/>
				))}

				{getObjLength(persons) > 0 && (
					<div className="contacts__body__headerWrapper">
						<h3>{t('Persons')}</h3>
						<IconButton
							onClick={() => setPersonsVisible((prevState) => !prevState)}
							size="large"
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
						<h3>{t('Contacts')}</h3>
						<IconButton
							onClick={() => setContactsVisible((prevState) => !prevState)}
							size="large"
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
