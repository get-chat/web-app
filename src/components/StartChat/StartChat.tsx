import React, { useEffect, useRef, useState } from 'react';
import {
	Button,
	IconButton,
	InputAdornment,
	ListItem,
	TextField,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { useLocation, useNavigate } from 'react-router-dom';
import { addPlus, prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import Recipient from '@src/interfaces/Recipient';
import { AxiosResponse, CancelTokenSource } from 'axios';
import * as Styled from './StartChat.styles';
import Contacts from '@src/components/Contacts';

interface Props {
	onHide: () => void;
}

const StartChat: React.FC<Props> = ({ onHide }) => {
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const [isVerifying, setVerifying] = useState(false);
	const [isPhoneNumberFormVisible, setPhoneNumberFormVisible] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');

	let verifyPhoneNumberCancelTokenSourceRef = useRef<CancelTokenSource>();

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				onHide();
				event.stopPropagation();
			}
		};

		document.addEventListener('keydown', handleKey);

		verifyPhoneNumberCancelTokenSourceRef.current = generateCancelToken();

		return () => {
			document.removeEventListener('keydown', handleKey);
			verifyPhoneNumberCancelTokenSourceRef.current?.cancel();
		};
	}, []);

	const verifyContact = (phoneNumber: string, data?: Recipient) => {
		const failureCallback = () => {
			// @ts-ignore
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
			verifyPhoneNumberCancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				if (
					response.data.contacts &&
					response.data.contacts.length > 0 &&
					response.data.contacts[0].status === 'valid' &&
					response.data.contacts[0].wa_id !== 'invalid'
				) {
					const returnedWaId = response.data.contacts[0].wa_id;

					navigate(`/main/chat/${returnedWaId}${location.search}`, {
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
					onHide();
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
		<Styled.ContactsContainer>
			<Styled.ContactsHeader>
				<IconButton onClick={onHide} size="large">
					<ArrowBack />
				</IconButton>

				<h3>{t('New chat')}</h3>
			</Styled.ContactsHeader>

			<Styled.StartByPhoneNumberWrapper>
				<Styled.StartByPhoneNumber
					onClick={() => setPhoneNumberFormVisible((prevState) => !prevState)}
				>
					<ListItem button>
						<Styled.StartByPhoneNumberInner data-test-id="start-new-chat">
							<DialpadIcon />
							<span>{t('Start a chat with a phone number')}</span>
						</Styled.StartByPhoneNumberInner>
					</ListItem>
				</Styled.StartByPhoneNumber>

				{isPhoneNumberFormVisible && (
					<Styled.FormWrapper>
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
							onClick={() => verifyContact(phoneNumber)}
							data-test-id="start-chat-by-phone"
						>
							{t('Start')}
						</Button>
					</Styled.FormWrapper>
				)}
			</Styled.StartByPhoneNumberWrapper>

			<Contacts verifyContact={verifyContact} isVerifying={isVerifying} />
		</Styled.ContactsContainer>
	);
};

export default StartChat;
